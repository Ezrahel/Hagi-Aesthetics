import { Canvas, useThree } from '@react-three/fiber'
import React, { useEffect } from 'react'
import { Hand } from './Hand'
import * as THREE from 'three'
const Scene = () => {
    return (
        <>
            <div className='hidden lg:block w-full h-[60vh] lg:h-screen fixed top-0 overflow-visible'>
                <Canvas >
                    <ambientLight />
                    <pointLight position={[10, 10, 10]} />
                    <Hand />
                    <Environment />
                </Canvas>
            </div>
        </>
    )
}

export default Scene

function Environment() {
    const { scene } = useThree()

    useEffect(() => {
        const cubeTextureLoader = new THREE.CubeTextureLoader()
        const environmentMap = cubeTextureLoader.load([
            '/textures/environmentMaps/4/px.jpg',
            '/textures/environmentMaps/4/nx.jpg',
            '/textures/environmentMaps/4/py.jpg',
            '/textures/environmentMaps/4/ny.jpg',
            '/textures/environmentMaps/4/pz.jpg',
            '/textures/environmentMaps/4/nz.jpg',
        ])

        scene.environment = environmentMap
    }, [scene])

    return null
}