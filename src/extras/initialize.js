import * as THREE from "three";

import { WebGLRendererSystem } from "./systems/WebGLRendererSystem.js";
import { TransformSystem } from "./systems/TransformSystem.js";
import { UpdateAspectOnResizeSystem } from "./systems/UpdateAspectOnResizeSystem.js";
import { OnObject3DAddedSystem } from "./systems/OnObject3DAddedSystem.js";

import {
  WebGLRenderer,
  Scene,
  Active,
  RenderPass,
  Camera,
  CameraRig,
  Parent,
  UpdateAspectOnResizeTag,
  OnObject3DAdded
} from "./components/index.js";
import {
  Object3DComponent,
  SceneTagComponent,
  CameraTagComponent,
  MeshTagComponent
} from "../core/components.js";

import { ECSYThreeWorld } from "../core/world.js";

export function initialize(world = new ECSYThreeWorld(), options) {
  if (!(world instanceof ECSYThreeWorld)) {
    throw new Error(
      "The provided 'world' paremeter is not an instance of 'ECSYThreeWorld'"
    );
  }

  world
    .registerSystem(UpdateAspectOnResizeSystem)
    .registerSystem(TransformSystem)
    .registerSystem(OnObject3DAddedSystem)
    .registerSystem(WebGLRendererSystem);

  world
    .registerComponent(OnObject3DAdded)
    .registerComponent(WebGLRenderer)
    .registerComponent(Scene)
    .registerComponent(Active)
    .registerComponent(CameraRig)
    .registerComponent(Parent)
    .registerComponent(Object3DComponent)
    .registerComponent(RenderPass)
    .registerComponent(Camera)
    // Tags
    .registerComponent(SceneTagComponent)
    .registerComponent(CameraTagComponent)
    .registerComponent(MeshTagComponent)
    .registerComponent(UpdateAspectOnResizeTag);

  const DEFAULT_OPTIONS = {
    vr: false,
    defaults: true
  };

  options = Object.assign({}, DEFAULT_OPTIONS, options);

  if (!options.defaults) {
    return { world };
  }

  let animationLoop = options.animationLoop;
  if (!animationLoop) {
    const clock = new THREE.Clock();
    animationLoop = () => {
      world.execute(clock.getDelta(), clock.elapsedTime);
    };
  }

  let scene = world
    .createEntity()
    .addComponent(Scene)
    .addObject3DComponent(new THREE.Scene());

  let renderer = world.createEntity().addComponent(WebGLRenderer, {
    ar: options.ar,
    vr: options.vr,
    animationLoop: animationLoop
  });

  // camera rig & controllers
  var camera = null,
    cameraRig = null;
  if (options.ar || options.vr) {
    cameraRig = world
      .createEntity()
      .addComponent(CameraRig)
      .addComponent(Parent, { value: scene })
      .addComponent(Active);
  } else {
    camera = world
      .createEntity()
      .addComponent(Camera)
      .addComponent(UpdateAspectOnResizeTag)
      .addObject3DComponent(
        new THREE.PerspectiveCamera(
          90,
          window.innerWidth / window.innerHeight,
          0.1,
          100
        ),
        scene
      )
      .addComponent(Active);
  }

  let renderPass = world.createEntity().addComponent(RenderPass, {
    scene: scene,
    camera: camera
  });

  return {
    world,
    entities: {
      scene,
      camera,
      cameraRig,
      renderer,
      renderPass
    }
  };
}
