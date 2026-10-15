Vendored three.js r160 (MIT, see LICENSE) so the app works without a CDN.
Use this importmap in index.html:

    <script type="importmap">
    {"imports":{"three":"./vendor/three/build/three.module.min.js","three/addons/":"./vendor/three/examples/jsm/"}}
    </script>

Draco decoder path for DRACOLoader.setDecoderPath: ./vendor/three/examples/jsm/libs/draco/gltf/
