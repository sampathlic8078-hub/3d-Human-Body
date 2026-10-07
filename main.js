import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js";

import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";

import { DRACOLoader } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/DRACOLoader.js";


/* =========================================================
   BASIC SETUP
========================================================= */

const container =
    document.getElementById("three-container");

const bodyStage =
    document.querySelector(".body-stage");

const scene =
    new THREE.Scene();

scene.background =
    new THREE.Color(0x05070c);


/* =========================================================
   CAMERA
========================================================= */

const camera =
    new THREE.PerspectiveCamera(
        35,
        container.clientWidth /
            container.clientHeight,
        0.01,
        100
    );

camera.position.set(
    0,
    0,
    7
);


/* =========================================================
   RENDERER
========================================================= */

const renderer =
    new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });

renderer.setSize(
    container.clientWidth,
    container.clientHeight
);

renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        2
    )
);

renderer.outputColorSpace =
    THREE.SRGBColorSpace;

renderer.toneMapping =
    THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure =
    1.15;

container.appendChild(
    renderer.domElement
);


/* =========================================================
   LIGHTS
========================================================= */

scene.add(
    new THREE.AmbientLight(
        0xffffff,
        2
    )
);


const keyLight =
    new THREE.DirectionalLight(
        0xffffff,
        3.5
    );

keyLight.position.set(
    4,
    6,
    5
);

scene.add(
    keyLight
);


const fillLight =
    new THREE.DirectionalLight(
        0x9fc8ff,
        2.5
    );

fillLight.position.set(
    -4,
    3,
    2
);

scene.add(
    fillLight
);


const rimLight =
    new THREE.PointLight(
        0x78adff,
        5,
        15
    );

rimLight.position.set(
    0,
    2,
    -4
);

scene.add(
    rimLight
);


/* =========================================================
   ORBIT CONTROLS
========================================================= */

const controls =
    new OrbitControls(
        camera,
        renderer.domElement
    );

controls.enableDamping =
    true;

controls.dampingFactor =
    0.05;

controls.enablePan =
    false;

controls.minDistance =
    2.5;

controls.maxDistance =
    10;

controls.autoRotate =
    true;

controls.autoRotateSpeed =
    0.35;


/* =========================================================
   LOADERS
========================================================= */

const loader =
    new GLTFLoader();


const dracoLoader =
    new DRACOLoader();

dracoLoader.setDecoderPath(
    "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/libs/draco/"
);

loader.setDRACOLoader(
    dracoLoader
);


/* =========================================================
   GLOBAL STATE
========================================================= */

let humanBody =
    null;

let selectedOrgan =
    null;

let selectedOrganRoot =
    null;


const organRoots =
    {};

const hotspotObjects =
    [];

const organTargets =
    {};


/* =========================================================
   ORGAN DATA
========================================================= */

const ORGAN_DATA = {

    heart: {
        name: "❤️ Heart",
        file: "models/heart.glb",
        x: -0.12,
        y: 0.55,
        z: 0.22,
        size: 0.72
    },

    brain: {
        name: "🧠 Brain",
        file: "models/brain.glb",
        x: 0,
        y: 1.85,
        z: 0.15,
        size: 1.05
    },

    lungs: {
        name: "🫁 Lungs",
        file: "models/lungs.glb",
        x: 0,
        y: 0.82,
        z: 0.20,
        size: 1.15
    },

    liver: {
        name: "🟤 Liver",
        file: "models/liver.glb",
        x: 0.22,
        y: 0.20,
        z: 0.20,
        size: 0.95
    },

    kidney: {
        name: "🫘 Kidney",
        file: "models/kidney.glb",
        x: 0,
        y: -0.15,
        z: 0.20,
        size: 0.68
    }

};


/* =========================================================
   ORGAN EXPLANATION
========================================================= */

const ORGAN_TEXT = {

    heart:
        "Naan heart. Naan chest-la irundhu blood-a full body-ku pump panren. Enakku four chambers irukku: right atrium, right ventricle, left atrium and left ventricle.",

    brain:
        "Naan brain. Naan nervous system-oda main control centre. Thinking, memory, movement, sensation and many body functions-a control panren.",

    lungs:
        "Naan lungs. Naan respiration-ku main organ. Alveoli-la oxygen blood-kulla pogum and carbon dioxide blood-lendhu veliya varum.",

    liver:
        "Naan liver. Naan metabolism-la important role play panren. Bile produce panren, glycogen store panren and nutrients process panna help panren.",

    kidney:
        "Naan kidney. Naan blood-a filter panni waste remove panren. Urine formation and water balance maintain panna help panren."

};


/* =========================================================
   ORGAN INFO
========================================================= */

const ORGAN_INFO = {

    heart:
        "Four chambers • valves • blood circulation",

    brain:
        "Cerebrum • cerebellum • brainstem • nervous control",

    lungs:
        "Bronchi • bronchioles • alveoli • gas exchange",

    liver:
        "Metabolism • bile • glycogen storage",

    kidney:
        "Nephron • filtration • urine formation"

};


/* =========================================================
   TALKING PANEL
========================================================= */

const panel =
    document.createElement(
        "div"
    );

panel.className =
    "talking-organ-panel";

panel.innerHTML = `

    <h2 id="organPanelTitle">
        Select an organ
    </h2>

    <div
        class="talking-organ-speech"
        id="organPanelSpeech"
    >
        Click an organ to explore it.
    </div>

    <div
        class="talking-organ-info"
        id="organPanelInfo"
    >
        Explore the human body interactively.
    </div>

`;

if (bodyStage) {

    bodyStage.appendChild(
        panel
    );

}


const panelTitle =
    document.getElementById(
        "organPanelTitle"
    );

const panelSpeech =
    document.getElementById(
        "organPanelSpeech"
    );

const panelInfo =
    document.getElementById(
        "organPanelInfo"
    );


/* =========================================================
   LOAD BODY
========================================================= */

loader.load(

    "models/body.glb",

    function (gltf) {

        humanBody =
            gltf.scene;

        scene.add(
            humanBody
        );


        const box =
            new THREE.Box3()
                .setFromObject(
                    humanBody
                );


        const size =
            new THREE.Vector3();

        const center =
            new THREE.Vector3();


        box.getSize(
            size
        );

        box.getCenter(
            center
        );


        /* CENTER */

        humanBody.position.sub(
            center
        );


        /* SCALE */

        const targetHeight =
            4.4;

        if (size.y > 0) {

            const scale =
                targetHeight /
                size.y;

            humanBody.scale.setScalar(
                scale
            );

        }


        /* FINAL CENTER */

        const finalBox =
            new THREE.Box3()
                .setFromObject(
                    humanBody
                );

        const finalCenter =
            new THREE.Vector3();


        finalBox.getCenter(
            finalCenter
        );


        humanBody.position.y -=
            finalCenter.y;


        /* MATERIAL */

        humanBody.traverse(
            function (object) {

                if (!object.isMesh) {
                    return;
                }


                object.castShadow =
                    true;

                object.receiveShadow =
                    true;


                if (!object.material) {
                    return;
                }


                const materials =
                    Array.isArray(
                        object.material
                    )
                        ? object.material
                        : [object.material];


                materials.forEach(
                    function (material) {

                        material.roughness =
                            0.42;

                        material.metalness =
                            0.03;

                    }
                );

            }
        );


        controls.target.set(
            0,
            0,
            0
        );


        createHotspots();

        loadOrgans();


        console.log(
            "Human body loaded successfully."
        );

    },

    undefined,

    function (error) {

        console.error(
            "Human body loading failed:",
            error
        );

    }

);


/* =========================================================
   CREATE HOTSPOTS
========================================================= */

function createHotspots() {

    Object.keys(
        ORGAN_DATA
    ).forEach(
        function (key) {

            const data =
                ORGAN_DATA[key];


            const geometry =
                new THREE.SphereGeometry(
                    0.30,
                    20,
                    20
                );


            const material =
                new THREE.MeshBasicMaterial({
                    transparent: true,
                    opacity: 0,
                    depthWrite: false
                });


            const hotspot =
                new THREE.Mesh(
                    geometry,
                    material
                );


            hotspot.position.set(
                data.x,
                data.y,
                data.z
            );


            hotspot.userData.organ =
                key;


            scene.add(
                hotspot
            );


            hotspotObjects.push(
                hotspot
            );


            organTargets[key] =
                hotspot.position.clone();

        }
    );

}


/* =========================================================
   LOAD ORGANS
========================================================= */

function loadOrgans() {

    Object.keys(
        ORGAN_DATA
    ).forEach(
        function (key) {

            const data =
                ORGAN_DATA[key];


            loader.load(

                data.file,

                function (gltf) {

                    const model =
                        gltf.scene;


                    /* -----------------------------------------
                       FIND MODEL BOUNDS
                    ----------------------------------------- */

                    const box =
                        new THREE.Box3()
                            .setFromObject(
                                model
                            );


                    const center =
                        new THREE.Vector3();

                    const size =
                        new THREE.Vector3();


                    box.getCenter(
                        center
                    );

                    box.getSize(
                        size
                    );


                    /* -----------------------------------------
                       CENTER MODEL
                    ----------------------------------------- */

                    const root =
                        new THREE.Group();


                    model.position.sub(
                        center
                    );


                    root.add(
                        model
                    );


                    /* -----------------------------------------
                       SCALE
                    ----------------------------------------- */

                    const maxDimension =
                        Math.max(
                            size.x,
                            size.y,
                            size.z
                        );


                    if (
                        maxDimension > 0
                    ) {

                        const scale =
                            data.size /
                            maxDimension;

                        root.scale.setScalar(
                            scale
                        );

                    }


                    /* -----------------------------------------
                       ORIGINAL POSITION
                    ----------------------------------------- */

                    root.position.set(
                        data.x,
                        data.y,
                        data.z
                    );


                    /* -----------------------------------------
                       SAVE TRANSFORMS
                    ----------------------------------------- */

                    root.userData.basePosition =
                        root.position.clone();

                    root.userData.baseScale =
                        root.scale.clone();

                    root.userData.baseRotation =
                        root.rotation.clone();


                    /* -----------------------------------------
                       MATERIAL
                    ----------------------------------------- */

                    root.traverse(
                        function (object) {

                            if (!object.isMesh) {
                                return;
                            }

                            object.castShadow =
                                true;

                            object.receiveShadow =
                                true;

                        }
                    );


                    /* -----------------------------------------
                       HIDE INITIALLY
                    ----------------------------------------- */

                    root.visible =
                        false;


                    scene.add(
                        root
                    );


                    organRoots[key] =
                        root;


                    console.log(
                        "3D " +
                        key +
                        " loaded successfully."
                    );


                    /* -----------------------------------------
                       IF USER CLICKED DURING LOADING
                    ----------------------------------------- */

                    if (
                        selectedOrgan === key
                    ) {

                        selectOrgan(
                            key
                        );

                    }

                },

                undefined,

                function (error) {

                    console.error(
                        "3D " +
                        key +
                        " loading failed:",
                        error
                    );

                }

            );

        }
    );

}


/* =========================================================
   RAYCASTING
========================================================= */

const raycaster =
    new THREE.Raycaster();

const pointer =
    new THREE.Vector2();


function updatePointer(
    event
) {

    const rect =
        renderer.domElement
            .getBoundingClientRect();


    pointer.x =
        (
            (
                event.clientX -
                rect.left
            ) /
            rect.width
        ) * 2 - 1;


    pointer.y =
        -(
            (
                event.clientY -
                rect.top
            ) /
            rect.height
        ) * 2 + 1;

}


renderer.domElement.addEventListener(
    "pointerdown",
    function (event) {

        updatePointer(
            event
        );


        raycaster.setFromCamera(
            pointer,
            camera
        );


        const hits =
            raycaster.intersectObjects(
                hotspotObjects,
                false
            );


        if (
            hits.length === 0
        ) {
            return;
        }


        const organ =
            hits[0]
                .object
                .userData
                .organ;


        selectOrgan(
            organ
        );

    }
);


/* =========================================================
   SELECT ORGAN
========================================================= */

function selectOrgan(
    key
) {

    const data =
        ORGAN_DATA[key];

    if (!data) {
        return;
    }


    selectedOrgan =
        key;


    controls.autoRotate =
        false;


    /* -----------------------------------------
       RESET OTHER ORGANS
    ----------------------------------------- */

    Object.keys(
        organRoots
    ).forEach(
        function (name) {

            const root =
                organRoots[name];

            if (!root) {
                return;
            }


            root.visible =
                false;


            root.position.copy(
                root.userData
                    .basePosition
            );


            root.scale.copy(
                root.userData
                    .baseScale
            );


            root.rotation.copy(
                root.userData
                    .baseRotation
            );

        }
    );


    /* -----------------------------------------
       KEEP BODY VISIBLE
    ----------------------------------------- */

    setBodyOpacity(
        0.32
    );


    /* -----------------------------------------
       SELECTED ORGAN
    ----------------------------------------- */

    const root =
        organRoots[key];


    if (!root) {

        if (panelSpeech) {

            panelSpeech.textContent =
                "3D organ loading...";

        }

        return;

    }


    root.visible =
        true;


    /* -----------------------------------------
       MOVE ORGAN TO CENTER
    ----------------------------------------- */

    root.position.set(
        0,
        0,
        1.0
    );


    /* -----------------------------------------
       START SMALL
    ----------------------------------------- */

    root.scale.copy(
        root.userData
            .baseScale
    );


    root.scale.multiplyScalar(
        0.08
    );


    root.rotation.copy(
        root.userData
            .baseRotation
    );


    selectedOrganRoot =
        root;


    /* -----------------------------------------
       CAMERA
    ----------------------------------------- */

    camera.position.set(
        0,
        0,
        7
    );


    controls.target.set(
        0,
        0,
        0
    );


    controls.update();


    /* -----------------------------------------
       PANEL
    ----------------------------------------- */

    if (panelTitle) {

        panelTitle.textContent =
            data.name;

    }


    if (panelSpeech) {

        panelSpeech.textContent =
            ORGAN_TEXT[key];

    }


    if (panelInfo) {

        panelInfo.textContent =
            ORGAN_INFO[key];

    }


    panel.classList.add(
        "active"
    );


    /* -----------------------------------------
       AUTOMATIC VOICE
    ----------------------------------------- */

    speakAnswer(
        ORGAN_TEXT[key]
    );

}


/* =========================================================
   BODY OPACITY
========================================================= */

function setBodyOpacity(
    opacity
) {

    if (!humanBody) {
        return;
    }


    humanBody.traverse(
        function (object) {

            if (!object.isMesh) {
                return;
            }


            if (!object.material) {
                return;
            }


            const materials =
                Array.isArray(
                    object.material
                )
                    ? object.material
                    : [object.material];


            materials.forEach(
                function (material) {

                    material.transparent =
                        opacity < 1;

                    material.opacity =
                        opacity;

                }
            );

        }
    );

}


/* =========================================================
   ORGAN ANIMATION
========================================================= */

function animateOrgan(
    time
) {

    if (
        !selectedOrganRoot ||
        !selectedOrgan
    ) {
        return;
    }


    const root =
        selectedOrganRoot;


    const baseScale =
        root.userData
            .baseScale;


    const targetScale =
        baseScale
            .clone()
            .multiplyScalar(
                1.35
            );


    /* -----------------------------------------
       POP-OUT SIZE
    ----------------------------------------- */

    root.scale.lerp(
        targetScale,
        0.09
    );


    /* -----------------------------------------
       HEARTBEAT
    ----------------------------------------- */

    if (
        selectedOrgan ===
        "heart"
    ) {

        const pulse =
            1 +
            Math.sin(
                time * 0.011
            ) * 0.075;


        root.scale.copy(
            targetScale
        );


        root.scale.multiplyScalar(
            pulse
        );

    }


    /* -----------------------------------------
       LUNGS BREATHING
    ----------------------------------------- */

    else if (
        selectedOrgan ===
        "lungs"
    ) {

        const breathe =
            1 +
            Math.sin(
                time * 0.003
            ) * 0.07;


        root.scale.set(
            targetScale.x *
                breathe,

            targetScale.y *
                breathe,

            targetScale.z
        );

    }


    /* -----------------------------------------
       BRAIN PULSE
    ----------------------------------------- */

    else if (
        selectedOrgan ===
        "brain"
    ) {

        const pulse =
            1 +
            Math.sin(
                time * 0.005
            ) * 0.035;


        root.scale.copy(
            targetScale
        );


        root.scale.multiplyScalar(
            pulse
        );

    }


    /* -----------------------------------------
       LIVER
    ----------------------------------------- */

    else if (
        selectedOrgan ===
        "liver"
    ) {

        root.rotation.y =
            root.userData
                .baseRotation
                .y +
            Math.sin(
                time * 0.002
            ) * 0.15;

    }


    /* -----------------------------------------
       KIDNEY
    ----------------------------------------- */

    else if (
        selectedOrgan ===
        "kidney"
    ) {

        root.rotation.y =
            root.userData
                .baseRotation
                .y +
            Math.sin(
                time * 0.002
            ) * 0.12;

    }

}


/* =========================================================
   TEXT TO SPEECH
   ORIGINAL SIMPLE VERSION
========================================================= */

function speakAnswer(
    text
) {

    if (
        !("speechSynthesis" in window)
    ) {
        return;
    }


    window.speechSynthesis.cancel();


    const speech =
        new SpeechSynthesisUtterance(
            text
        );


    speech.lang =
        "en-IN";

    speech.rate =
        0.95;

    speech.pitch =
        1;


    window.speechSynthesis.speak(
        speech
    );

}


/* =========================================================
   VOICE RECOGNITION
========================================================= */

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


let recognition =
    null;

let isListening =
    false;


const voiceButton =
    document.getElementById(
        "voiceButton"
    );


const voiceMainButton =
    document.getElementById(
        "voiceMainButton"
    );


const voiceText =
    document.getElementById(
        "voiceText"
    );


const voiceButtonText =
    document.getElementById(
        "voiceButtonText"
    );


if (SpeechRecognition) {

    recognition =
        new SpeechRecognition();


    recognition.lang =
        "en-IN";


    recognition.continuous =
        false;


    recognition.interimResults =
        false;


    recognition.maxAlternatives =
        3;


    recognition.onstart =
        function () {

            isListening =
                true;


            if (voiceText) {

                voiceText.textContent =
                    "Listening... Pesunga 🎤";

            }


            if (voiceButtonText) {

                voiceButtonText.textContent =
                    "Listening...";

            }

        };


    recognition.onresult =
        function (event) {

            const result =
                event.results[
                    event.results.length - 1
                ];


            const command =
                result[0]
                    .transcript
                    .toLowerCase()
                    .trim();


            if (voiceText) {

                voiceText.textContent =
                    `You said: "${command}"`;

            }


            processVoiceCommand(
                command
            );

        };


    recognition.onend =
        function () {

            isListening =
                false;


            if (voiceButtonText) {

                voiceButtonText.textContent =
                    "Talk to me";

            }

        };


    recognition.onerror =
        function () {

            isListening =
                false;


            if (voiceText) {

                voiceText.textContent =
                    "Voice error. Try again.";

            }


            if (voiceButtonText) {

                voiceButtonText.textContent =
                    "Talk to me";

            }

        };

}


/* =========================================================
   START VOICE
========================================================= */

function startVoice() {

    if (!recognition) {

        alert(
            "Voice recognition is not supported in this browser."
        );

        return;

    }


    if (isListening) {

        recognition.stop();

        return;

    }


    try {

        recognition.start();

    }

    catch (error) {

        console.log(error);

    }

}


/* =========================================================
   VOICE BUTTONS
========================================================= */

if (voiceButton) {

    voiceButton.addEventListener(
        "click",
        startVoice
    );

}


if (voiceMainButton) {

    voiceMainButton.addEventListener(
        "click",
        startVoice
    );

}


/* =========================================================
   VOICE COMMANDS
========================================================= */
/* =========================================================
   VOICE COMMANDS + ORGAN QUESTIONS
========================================================= */
/* =========================================================
   AI BIOLOGY ASSISTANT
========================================================= */

async function askBiologyAI(question) {

    if (voiceText) {
        voiceText.textContent =
            "🧠 AI thinking...";
    }

    try {

        const response = await fetch("/api/biology",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    question: question
                })
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error || "AI request failed"
            );

        }


        const answer =
            data.answer ||
            "Sorry, answer kidaikkala.";


        /* Show answer */
        if (voiceText) {

            voiceText.textContent =
                answer;

        }


        /* Speak answer */
        speakAnswer(answer);


        console.log(
            "AI Answer:",
            answer
        );

    }

    catch (error) {

        console.error(
            "AI ERROR:",
            error
        );


        if (voiceText) {

            voiceText.textContent =
                "AI connect aagala. Server check pannunga.";

        }

    }

}
/* =========================================================
   VOICE COMMANDS + AI
========================================================= */

function processVoiceCommand(command) {

    command =
        command.toLowerCase().trim();


    /* -----------------------------------------
       QUESTION → AI
    ----------------------------------------- */

    const questionWords = [

        "what",
        "why",
        "how",
        "where",
        "when",
        "which",
        "who",
        "can",
        "does",
        "do",
        "is",
        "are",
        "explain",
        "tell",
        "function",
        "difference",
        "meaning"

    ];


    const looksLikeQuestion =
        questionWords.some(function (word) {

            return command.includes(word);

        });


    if (looksLikeQuestion) {

        askBiologyAI(
            command
        );

        return;

    }


    /* -----------------------------------------
       ORGAN SHORTCUTS
    ----------------------------------------- */

    if (
        command === "heart" ||
        command === "idhayam"
    ) {

        selectOrgan("heart");
        return;

    }


    if (
        command === "brain" ||
        command === "moolai"
    ) {

        selectOrgan("brain");
        return;

    }


    if (
        command === "lung" ||
        command === "lungs" ||
        command === "moochu"
    ) {

        selectOrgan("lungs");
        return;

    }


    if (
        command === "liver" ||
        command === "kalleeral"
    ) {

        selectOrgan("liver");
        return;

    }


    if (
        command === "kidney" ||
        command === "siruneeragam"
    ) {

        selectOrgan("kidney");
        return;

    }


    /* -----------------------------------------
       DISEASE
    ----------------------------------------- */

    if (
        command.includes("disease") ||
        command.includes("diseases") ||
        command.includes("noi")
    ) {

        speakAnswer(
            "Disease explorer open panren."
        );

        window.location.hash =
            "diseases";

        return;

    }


    /* -----------------------------------------
       EXPLORE
    ----------------------------------------- */

    if (
        command.includes("explore")
    ) {

        speakAnswer(
            "Human body explorer open panren."
        );

        window.location.hash =
            "explore";

        return;

    }


    /* -----------------------------------------
       HOME
    ----------------------------------------- */

    if (
        command.includes("home")
    ) {

        speakAnswer(
            "Home page-ku pogalam."
        );

        window.location.hash =
            "home";

        return;

    }


    /* -----------------------------------------
       EVERYTHING ELSE → AI
    ----------------------------------------- */

    askBiologyAI(
        command
    );

}
/* =========================================================
   RESIZE
========================================================= */

window.addEventListener(
    "resize",
    function () {

        const width =
            container.clientWidth;

        const height =
            container.clientHeight;


        camera.aspect =
            width / height;


        camera.updateProjectionMatrix();


        renderer.setSize(
            width,
            height
        );

    }
);


/* =========================================================
   ANIMATION LOOP
========================================================= */

function animate(
    time
) {

    requestAnimationFrame(
        animate
    );


    controls.update();


    animateOrgan(
        time
    );


    renderer.render(
        scene,
        camera
    );

}

animate(0);


/* =========================================================
   ESCAPE
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.code ===
            "Escape"
        ) {

            resetOrgan();

        }

    }
);


/* =========================================================
   MEET MY ORGANS → 3D ORGAN
========================================================= */

document
    .querySelectorAll(".organ-card")
    .forEach(function (card) {

        card.addEventListener(
            "click",
            function () {

                const text =
                    card.textContent
                        .toLowerCase();

                let organ =
                    null;


                if (
                    text.includes("heart")
                ) {

                    organ =
                        "heart";

                }

                else if (
                    text.includes("brain")
                ) {

                    organ =
                        "brain";

                }

                else if (
                    text.includes("lung")
                ) {

                    organ =
                        "lungs";

                }

                else if (
                    text.includes("liver")
                ) {

                    organ =
                        "liver";

                }

                else if (
                    text.includes("kidney")
                ) {

                    organ =
                        "kidney";

                }


                if (!organ) {
                    return;
                }


                /* Select 3D organ */

                selectOrgan(
                    organ
                );


                /* Highlight card */

                document
                    .querySelectorAll(
                        ".organ-card"
                    )
                    .forEach(
                        function (other) {

                            other.classList.remove(
                                "organ-card-selected"
                            );

                        }
                    );


                card.classList.add(
                    "organ-card-selected"
                );


                console.log(
                    "Meet My Organs:",
                    organ
                );

            }
        );

    });


console.log(
    "Human Body 3D ready."
);