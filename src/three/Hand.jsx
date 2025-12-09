import React, { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, PerspectiveCamera, useAnimations } from '@react-three/drei'
import { useGraph } from '@react-three/fiber'
import { SkeletonUtils } from 'three-stdlib'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function Hand(props) {
  const group = useRef()
  const fluidMesh = useRef()
  const cameraRef = useRef()
  const mixer = useRef()
  const animation1 = useRef()
  const animation2 = useRef()
  const scrollAnimation = useRef()
  const cameraAnimation = useRef()

  const { scene, animations } = useGLTF('/hand2.glb')
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { nodes, materials } = useGraph(clone)
  const { actions } = useAnimations(animations, group)

  useEffect(() => {
    if (!actions || !group.current) return

    mixer.current = new THREE.AnimationMixer(group.current)

    const actionClip = animations.find(clip => clip.name === 'Action')
    if (actionClip) {
      animation1.current = mixer.current.clipAction(actionClip)
      animation1.current.setLoop(THREE.LoopOnce, 0)
      animation1.current.clampWhenFinished = true
      animation1.current.play()
      animation1.current.paused = true
    }

    const boxClip = animations.find(clip => clip.name === 'box')
    if (boxClip) {
      animation2.current = mixer.current.clipAction(boxClip)
      animation2.current.setLoop(THREE.LoopOnce, 0)
      animation2.current.clampWhenFinished = true
      animation2.current.reset()
      animation2.current.play()
      animation2.current.paused = true
    }

    if (fluidMesh.current) {
      fluidMesh.current.visible = false
    }

    setupScrollAnimation()

    return () => {
      if (scrollAnimation.current) {
        scrollAnimation.current.kill()
      }
      if (cameraAnimation.current) {
        cameraAnimation.current.kill()
      }
      // Clean up all ScrollTrigger instances to prevent memory leaks
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars?.trigger === '#scrollarea') {
          trigger.kill()
        }
      })
    }
  }, [actions, animations])

  const setupScrollAnimation = () => {
    if (!animation1.current || !animation2.current) return

    const primaryDuration = animation1.current.getClip().duration
    const secondaryDuration = animation2.current.getClip().duration
    const offset = 2.3

    scrollAnimation.current = gsap.to(animation1.current, {
      time: primaryDuration,
      ease: "none",
      scrollTrigger: {
        trigger: "#scrollarea",
        start: "top top",
        end: "bottom+=10% bottom",
        scrub: true,
        onUpdate: () => {
          const t = animation1.current.time

          if (animation2.current) {
            animation2.current.time = t - offset
          }

          if (fluidMesh.current) {
            if (t >= offset && t <= offset + secondaryDuration) {
              fluidMesh.current.visible = true
            } else {
              fluidMesh.current.visible = false
            }
          }
        }
      }
    })

    if (cameraRef.current) {
      cameraAnimation.current = gsap.to(cameraRef.current.position,

        {
          x: 0.5,
          ease: "none",
          scrollTrigger: {
            trigger: "#scrollarea",
            start: "top top",
            end: "+=200",
            scrub: true
          }
        }
      )
    }
  }

  useFrame((state, delta) => {
    if (mixer.current) {
      mixer.current.update(delta)
    }
  })

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group name="hands" position={[-3.042, 0.707, 0.017]}>
          <primitive object={nodes.spine_03} />
          <primitive object={nodes.botry} />
          <primitive object={nodes.ikL} />
          <primitive object={nodes.ilR} />
          <primitive object={nodes.poleL} />
          <primitive object={nodes.poleR} />
          <skinnedMesh
            name="femailMesh"
            geometry={nodes.femailMesh.geometry}
            material={materials.femail}
            skeleton={nodes.femailMesh.skeleton}
            frustumCulled={false}
          />
        </group>
        <PerspectiveCamera
          ref={cameraRef}
          name="Camera"
          makeDefault={true}
          far={1000}
          near={0.1}
          fov={24}
          position={[1.0, 1.74, 10.107]}
        />
        <mesh
          ref={fluidMesh}
          name="fluid"
          geometry={nodes.fluid.geometry}
          material={materials.fluid}
          morphTargetDictionary={nodes.fluid.morphTargetDictionary}
          morphTargetInfluences={nodes.fluid.morphTargetInfluences}
          position={[-0.223, 0.267, 0.011]}
          rotation={[-0.145, 0.076, -0.178]}
          scale={[0.298, 0.111, 0.303]}
          frustumCulled={false}
        />
        <group name="Circle">
          <skinnedMesh
            name="Circle_1"
            geometry={nodes.Circle_1.geometry}
            material={materials.pink}
            skeleton={nodes.Circle_1.skeleton}
            frustumCulled={false}
          />
          <skinnedMesh
            name="Circle_2"
            geometry={nodes.Circle_2.geometry}
            material={materials.white}
            skeleton={nodes.Circle_2.skeleton}
            frustumCulled={false}
          />
          <skinnedMesh
            name="Circle_3"
            geometry={nodes.Circle_3.geometry}
            material={materials.lable}
            skeleton={nodes.Circle_3.skeleton}
            frustumCulled={false}
          />
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('/hand2.glb')