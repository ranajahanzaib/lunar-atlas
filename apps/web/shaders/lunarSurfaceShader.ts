import * as THREE from "three";

export const LunarSurfaceShader = {
  uniforms: {
    baseTexture: { value: null as THREE.Texture | null },
    overlayTexture: { value: null as THREE.Texture | null },
    hasOverlay: { value: 0 },
    overlayOpacity: { value: 0.85 },
    lightingMode: { value: 0 }, // 0: scientific neutral, 1: solar terminator
    lightDirection: { value: new THREE.Vector3(1.0, 0.2, 1.0).normalize() },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  fragmentShader: `
    uniform sampler2D baseTexture;
    uniform sampler2D overlayTexture;
    uniform int hasOverlay;
    uniform float overlayOpacity;
    uniform int lightingMode;
    uniform vec3 lightDirection;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vec4 baseTex = texture2D(baseTexture, vUv);
      vec3 finalColor = baseTex.rgb;

      if (hasOverlay == 1) {
        vec4 overlayTex = texture2D(overlayTexture, vUv);
        // Preserves photographic morphological relief while ensuring vibrant scientific colors
        float baseLum = dot(baseTex.rgb, vec3(0.299, 0.587, 0.114));
        vec3 reliefModulated = overlayTex.rgb * (0.85 + 0.35 * baseLum);
        finalColor = mix(baseTex.rgb, reliefModulated, overlayOpacity);
      }

      if (lightingMode == 1) {
        // Solar directional lighting with smooth terminator
        vec3 norm = normalize(vNormal);
        vec3 lightDir = normalize(lightDirection);
        float diff = max(dot(norm, lightDir), 0.0);
        // Subtle ambient light so night side remains visible in scientific workspace
        float ambient = 0.08;
        float shadow = smoothstep(-0.05, 0.15, dot(norm, lightDir));
        finalColor = finalColor * (ambient + (1.0 - ambient) * shadow);
      }

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `,
};
