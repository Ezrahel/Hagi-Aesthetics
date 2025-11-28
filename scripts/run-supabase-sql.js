#!/usr/bin/env node
// Small helper to run supabase-schema.sql against the Postgres URI in .env
const { readFileSync } = require('fs')
const { Client } = require('pg')
const path = require('path')

// Prefer IPv4 DNS results when possible to avoid ENETUNREACH on systems
// without working IPv6 routes (Node 18+). This is a best-effort preference
// and will be ignored on Node versions that don't support it.
try {
  require('dns').setDefaultResultOrder?.('ipv4first')
} catch (e) {
  // ignore if not supported
}

async function main() {
  const env = require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
  if (env.error) console.warn('.env not found or failed to load')
  const conn = process.env.SUPABASE_DB_URI
  if (!conn) {
    console.error('SUPABASE_DB_URI not set in .env')
    process.exit(1)
  }
  const sql = readFileSync(path.resolve(__dirname, '../supabase-schema.sql'), 'utf8')

  // Try resolving an IPv4 address for the host and connect to the IP while
  // preserving TLS servername (SNI) so certificate verification still works.
  let client
  try {
    const parsed = new URL(conn)
    const origHost = parsed.hostname
    const origPort = parsed.port || 5432
    const user = parsed.username
    const password = parsed.password
    const database = parsed.pathname ? parsed.pathname.slice(1) : undefined
    const dnsPromises = require('dns').promises
    const aRecords = await dnsPromises.resolve4(origHost).catch(() => [])
    if (aRecords && aRecords.length) {
      const ipv4 = aRecords[0]
      client = new Client({
        host: ipv4,
        port: origPort,
        user,
        password,
        database,
        ssl: { rejectUnauthorized: true, servername: origHost },
      })
    } else {
      client = new Client({ connectionString: conn })
    }
  } catch (e) {
    client = new Client({ connectionString: conn })
  }
  try {
    await client.connect()
    console.log('Connected to DB')
    await client.query(sql)
    console.log('Schema applied successfully')
  } catch (err) {
    console.error('Failed to run schema SQL', err)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
