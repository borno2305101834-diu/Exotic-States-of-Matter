// ============================================================
// Exotic States of Matter
// Bose-Einstein Condensate Phase Sandbox
// Part 7 - Sandbox Simulation
// ============================================================


// ============================================================
// HELPER
// ============================================================

const $ = (id) => document.getElementById(id);

const reduceMotion =
    window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;


// ============================================================
// ELEMENTS
// ============================================================

const tempEl = $("temp");
const numEl = $("num");
const freqEl = $("freq");
const interEl = $("inter");

const tempVal = $("tempVal");
const numVal = $("numVal");
const freqVal = $("freqVal");
const interVal = $("interVal");

const statT = $("statT");
const statTc = $("statTc");
const statRatio = $("statRatio");
const statFrac = $("statFrac");
const statPhase = $("statPhase");

const marker = $("marker");
const trapCount = $("trapCount");

const cards = document.querySelectorAll(".card");

const trapCanvas = $("trapCanvas");
const momCanvas = $("momCanvas");

const tctx = trapCanvas.getContext("2d");
const mctx = momCanvas.getContext("2d");


// ============================================================
// CANVAS RESIZE
// ============================================================

function fitCanvas(canvas) {

    const dpr =
        Math.max(
            1,
            window.devicePixelRatio || 1
        );

    const rect =
        canvas.getBoundingClientRect();

    canvas.width =
        Math.round(rect.width * dpr);

    canvas.height =
        Math.round(rect.height * dpr);

    const ctx =
        canvas.getContext("2d");

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );
}


function fitAll() {

    fitCanvas(trapCanvas);
    fitCanvas(momCanvas);

}


window.addEventListener(
    "resize",
    fitAll
);


// ============================================================
// PHYSICS STATE
// ============================================================

const state = {

    T: 250,

    N: 20,

    freq: 1.0,

    inter: 0.40

};


// ============================================================
// CRITICAL TEMPERATURE
// ============================================================

function computeTc() {

    return (
        40 *
        Math.cbrt(state.N) *
        state.freq
    );

}


// ============================================================
// CONDENSATE FRACTION
// ============================================================

function condensateFraction(T, Tc) {

    if (Tc <= 0) {
        return 0;
    }

    if (T >= Tc) {
        return 0;
    }

    const r = T / Tc;

    return Math.max(
        0,
        1 - r * r * r
    );

}


// ============================================================
// PARTICLES
// ============================================================

const PCOUNT = 240;

const particles = [];


for (
    let i = 0;
    i < PCOUNT;
    i++
) {

    particles.push({

        rank: i / PCOUNT,

        angle:
            Math.random() *
            Math.PI *
            2,

        shell:
            Math.random(),

        seed:
            Math.random() *
            1000,

        curX: 0,

        curY: 0,

        inited: false

    });

}


// ============================================================
// BASIC MATH
// ============================================================

function lerp(a, b, t) {

    return a + (b - a) * t;

}


function colorLerp(c1, c2, t) {

    return [

        lerp(c1[0], c2[0], t),

        lerp(c1[1], c2[1], t),

        lerp(c1[2], c2[2], t)

    ];

}


// ============================================================
// COLORS
// ============================================================

const HOT = [
    255,
    107,
    74
];

const GOLD = [
    232,
    184,
    75
];

const CYAN = [
    125,
    232,
    255
];


let smoothFrac = 0;


// ============================================================
// DRAW TRAP
// ============================================================

function drawTrap(time) {

    const w =
        trapCanvas.clientWidth;

    const h =
        trapCanvas.clientHeight;


    tctx.clearRect(
        0,
        0,
        w,
        h
    );


    const cx = w / 2;

    const cy = h / 2;


    // --------------------------------------------------------
    // Trap potential guide
    // --------------------------------------------------------

    tctx.strokeStyle =
        "rgba(125,232,255,0.14)";

    tctx.lineWidth = 1;

    tctx.beginPath();


    for (
        let x = -w * 0.42;
        x <= w * 0.42;
        x += 4
    ) {

        const yy =
            (x * x) /
            (w * 0.42 * w * 0.42) *
            h *
            0.34;

        const px =
            cx + x;

        const py =
            cy +
            h * 0.30 -
            yy;


        if (
            x === -w * 0.42
        ) {

            tctx.moveTo(
                px,
                py
            );

        } else {

            tctx.lineTo(
                px,
                py
            );

        }

    }


    tctx.stroke();


    // --------------------------------------------------------
    // Laser beams
    // --------------------------------------------------------

    tctx.strokeStyle =
        "rgba(255,59,92,0.14)";

    tctx.lineWidth = 1;


    tctx.beginPath();

    tctx.moveTo(
        cx - w * 0.46,
        cy
    );

    tctx.lineTo(
        cx + w * 0.46,
        cy
    );

    tctx.stroke();


    tctx.beginPath();

    tctx.moveTo(
        cx,
        cy - h * 0.46
    );

    tctx.lineTo(
        cx,
        cy + h * 0.46
    );

    tctx.stroke();


    // --------------------------------------------------------
    // Physics values
    // --------------------------------------------------------

    const Tc =
        computeTc();

    const targetFrac =
        condensateFraction(
            state.T,
            Tc
        );


    smoothFrac =
        lerp(
            smoothFrac,
            targetFrac,
            reduceMotion
                ? 1
                : 0.06
        );


    const condensedCount =
        Math.round(
            smoothFrac * PCOUNT
        );


    // --------------------------------------------------------
    // Cloud size
    // --------------------------------------------------------

    const thermalRadiusBase =
        Math.min(w, h) * 0.36;


    const tRadius =
        thermalRadiusBase *
        (
            0.22 +
            0.9 *
            Math.sqrt(
                state.T / 500
            )
        );


    const tfRadius =
        (
            Math.min(w, h) * 0.05 +
            state.inter *
            Math.min(w, h) *
            0.11
        ) *
        (
            0.65 +
            0.35 *
            smoothFrac
        );


    // --------------------------------------------------------
    // Temperature ratio
    // --------------------------------------------------------

    const ratio =
        Tc > 0
            ? state.T / Tc
            : 99;


    let baseColor;


    if (ratio > 1.15) {

        baseColor = HOT;

    }

    else if (ratio > 0.85) {

        baseColor =
            colorLerp(
                HOT,
                GOLD,
                1 -
                (ratio - 0.85) /
                0.3
            );

    }

    else {

        baseColor =
            colorLerp(
                GOLD,
                CYAN,
                Math.min(
                    1,
                    (0.85 - ratio) /
                    0.85
                )
            );

    }


    const t =
        time * 0.001;


    // --------------------------------------------------------
    // Draw particles
    // --------------------------------------------------------

    particles.forEach(
        (p, i) => {

            const isCondensed =
                i < condensedCount;


            let x;
            let y;
            let r;
            let color;
            let glow;


            // =================================================
            // CONDENSATE PARTICLE
            // =================================================

            if (isCondensed) {

                const shellR =
                    tfRadius *
                    Math.sqrt(
                        i /
                        Math.max(
                            1,
                            condensedCount
                        )
                    );


                const jitter =
                    reduceMotion
                        ? 0
                        : Math.sin(
                            t * 0.6 +
                            p.seed
                        ) * 1.4;


                x =
                    cx +
                    Math.cos(p.angle) *
                    (shellR + jitter);


                y =
                    cy +
                    Math.sin(p.angle) *
                    (shellR + jitter) *
                    0.94 +
                    h * 0.02;


                r = 1.6;

                color = CYAN;

                glow = 9;

            }


            // =================================================
            // THERMAL PARTICLE
            // =================================================

            else {

                const shellR =
                    tRadius *
                    Math.sqrt(p.shell);


                const wob =
                    reduceMotion
                        ? 0
                        :
                        (
                            Math.sin(
                                t *
                                (0.7 + p.shell) +
                                p.seed
                            ) * 3

                            +

                            Math.cos(
                                t * 0.5 +
                                p.seed * 1.7
                            ) * 3
                        );


                x =
                    cx +
                    Math.cos(
                        p.angle +
                        t *
                        0.03 *
                        (0.3 + p.shell)
                    ) *
                    shellR +
                    wob;


                y =
                    (
                        cy +
                        h * 0.06
                    )
                    +
                    Math.sin(
                        p.angle +
                        t *
                        0.03 *
                        (0.3 + p.shell)
                    ) *
                    shellR *
                    0.9
                    +
                    wob * 0.6
                    -
                    h * 0.08;


                r = 1.3;

                color = baseColor;

                glow = 4;

            }


            // ------------------------------------------------
            // Particle rendering
            // ------------------------------------------------

            tctx.beginPath();


            tctx.fillStyle =
                `rgba(
                    ${color[0] | 0},
                    ${color[1] | 0},
                    ${color[2] | 0},
                    0.92
                )`;


            tctx.shadowColor =
                `rgba(
                    ${color[0] | 0},
                    ${color[1] | 0},
                    ${color[2] | 0},
                    0.9
                )`;


            tctx.shadowBlur =
                glow;


            tctx.arc(
                x,
                y,
                r,
                0,
                Math.PI * 2
            );


            tctx.fill();

        }
    );


    tctx.shadowBlur = 0;


    return {

        Tc,

        targetFrac,

        smoothFrac,

        ratio

    };

}


// ============================================================
// MOMENTUM / TIME-OF-FLIGHT PROFILE
// ============================================================

function drawMomentum(info) {

    const w =
        momCanvas.clientWidth;

    const h =
        momCanvas.clientHeight;


    mctx.clearRect(
        0,
        0,
        w,
        h
    );


    const padL = 8;
    const padR = 8;
    const padT = 10;
    const padB = 8;


    const plotW =
        w -
        padL -
        padR;


    const plotH =
        h -
        padT -
        padB;


    const f =
        info.smoothFrac;


    const thermalAmp =
        1 - f;


    const condAmp =
        f;


    const thermalWidth =
        0.16 +
        0.55 *
        Math.sqrt(
            state.T / 500
        );


    const condWidth =
        0.045 +
        state.inter *
        0.07;


    const N = 160;

    const pts = [];

    let maxY = 0.001;


    // --------------------------------------------------------
    // Generate curve
    // --------------------------------------------------------

    for (
        let i = 0;
        i <= N;
        i++
    ) {

        const x =
            -1 +
            (
                2 * i / N
            );


        const yTh =
            thermalAmp *
            Math.exp(
                -(x * x) /
                (
                    2 *
                    thermalWidth *
                    thermalWidth
                )
            );


        const yC =
            condAmp *
            Math.exp(
                -(x * x) /
                (
                    2 *
                    condWidth *
                    condWidth
                )
            );


        const y =
            yTh + yC;


        pts.push([
            x,
            y
        ]);


        if (y > maxY) {

            maxY = y;

        }

    }


    // --------------------------------------------------------
    // Axis
    // --------------------------------------------------------

    mctx.strokeStyle =
        "rgba(138,147,172,0.35)";

    mctx.lineWidth = 1;


    mctx.beginPath();

    mctx.moveTo(
        padL,
        h - padB
    );

    mctx.lineTo(
        w - padR,
        h - padB
    );

    mctx.stroke();


    // --------------------------------------------------------
    // Filled curve
    // --------------------------------------------------------

    mctx.beginPath();


    pts.forEach(
        ([x, y], i) => {

            const px =
                padL +
                (
                    (x + 1) / 2
                ) *
                plotW;


            const py =
                (
                    h - padB
                )
                -
                (
                    y / maxY
                )
                *
                (
                    plotH * 0.92
                );


            if (i === 0) {

                mctx.moveTo(
                    px,
                    py
                );

            } else {

                mctx.lineTo(
                    px,
                    py
                );

            }

        }
    );


    mctx.lineTo(
        w - padR,
        h - padB
    );

    mctx.lineTo(
        padL,
        h - padB
    );

    mctx.closePath();


    const grad =
        mctx.createLinearGradient(
            0,
            padT,
            0,
            h - padB
        );


    const ratio =
        info.ratio;


    let topColor;


    if (ratio > 1.15) {

        topColor =
            "rgba(255,107,74,0.55)";

    }

    else if (ratio > 0.85) {

        topColor =
            "rgba(232,184,75,0.55)";

    }

    else {

        topColor =
            "rgba(125,232,255,0.55)";

    }


    grad.addColorStop(
        0,
        topColor
    );


    grad.addColorStop(
        1,
        "rgba(125,232,255,0.02)"
    );


    mctx.fillStyle = grad;

    mctx.fill();


    // --------------------------------------------------------
    // Curve stroke
    // --------------------------------------------------------

    mctx.beginPath();


    pts.forEach(
        ([x, y], i) => {

            const px =
                padL +
                (
                    (x + 1) / 2
                ) *
                plotW;


            const py =
                (
                    h - padB
                )
                -
                (
                    y / maxY
                )
                *
                (
                    plotH * 0.92
                );


            if (i === 0) {

                mctx.moveTo(
                    px,
                    py
                );

            } else {

                mctx.lineTo(
                    px,
                    py
                );

            }

        }
    );


    if (ratio > 1.15) {

        mctx.strokeStyle =
            "#FF6B4A";

    }

    else if (ratio > 0.85) {

        mctx.strokeStyle =
            "#E8B84B";

    }

    else {

        mctx.strokeStyle =
            "#7DE8FF";

    }


    mctx.lineWidth = 1.6;

    mctx.shadowColor =
        mctx.strokeStyle;

    mctx.shadowBlur = 8;

    mctx.stroke();

    mctx.shadowBlur = 0;

}


// ============================================================
// NUMBER FORMAT
// ============================================================

function fmtNum(n) {

    return n.toLocaleString(
        "en-US"
    );

}


// ============================================================
// UPDATE READOUT
// ============================================================

function updateReadout(info) {

    const Tc =
        info.Tc;

    const ratio =
        info.ratio;

    const frac =
        info.targetFrac;


    statT.textContent =
        `${state.T} nK`;


    statTc.textContent =
        `${Tc.toFixed(0)} nK`;


    statRatio.textContent =
        ratio > 9.99
            ? "—"
            : ratio.toFixed(2);


    statFrac.textContent =
        `${Math.round(frac * 100)}%`;


    let phaseLabel;
    let phaseClass;
    let cardPhase;
    let markerColor;


    // ========================================================
    // PHASE DETECTION
    // ========================================================

    if (ratio > 1.15) {

        phaseLabel =
            "Thermal Gas";

        phaseClass =
            "phase-thermal";

        cardPhase =
            "thermal";

        markerColor =
            "var(--hot)";

    }

    else if (ratio > 0.85) {

        phaseLabel =
            "Crossover Regime";

        phaseClass =
            "phase-cross";

        cardPhase =
            "cross";

        markerColor =
            "var(--gold)";

    }

    else {

        phaseLabel =
            "Bose–Einstein Condensate";

        phaseClass =
            "phase-bec";

        cardPhase =
            "bec";

        markerColor =
            "var(--cyan)";

    }


    statPhase.textContent =
        phaseLabel;


    statPhase.className =
        "v " + phaseClass;


    // ========================================================
    // PHASE MARKER
    // ========================================================

    const pct =
        Math.min(
            1,
            ratio / 2
        ) * 100;


    marker.style.left =
        pct + "%";


    marker.style.color =
        markerColor;


    // ========================================================
    // PHASE CARDS
    // ========================================================

    cards.forEach(
        (card) => {

            card.classList.toggle(
                "active",
                card.dataset.phase ===
                cardPhase
            );

        }
    );


    // ========================================================
    // ATOM COUNT
    // ========================================================

    trapCount.textContent =
        `N = ${fmtNum(
            state.N * 1000
        )}`;

}


// ============================================================
// ANIMATION LOOP
// ============================================================

function frame(time) {

    const sandboxPage =
        document.getElementById(
            "page-sandbox"
        );


    if (
        sandboxPage &&
        sandboxPage.classList.contains(
            "current"
        )
    ) {

        const info =
            drawTrap(time);


        drawMomentum(info);


        updateReadout(info);

    }


    requestAnimationFrame(frame);

}


// ============================================================
// UPDATE SLIDER LABELS
// ============================================================

function syncLabels() {

    tempVal.textContent =
        `${state.T} nK`;


    numVal.textContent =
        fmtNum(
            state.N * 1000
        );


    freqVal.textContent =
        `${state.freq.toFixed(2)}×`;


    interVal.textContent =
        state.inter.toFixed(2);

}


// ============================================================
// TEMPERATURE SLIDER
// ============================================================

tempEl.addEventListener(
    "input",
    (event) => {

        state.T =
            +event.target.value;

        syncLabels();

    }
);


// ============================================================
// ATOM NUMBER SLIDER
// ============================================================

numEl.addEventListener(
    "input",
    (event) => {

        state.N =
            +event.target.value;

        syncLabels();

    }
);


// ============================================================
// TRAP FREQUENCY SLIDER
// ============================================================

freqEl.addEventListener(
    "input",
    (event) => {

        state.freq =
            (+event.target.value) /
            100;

        syncLabels();

    }
);


// ============================================================
// INTERACTION STRENGTH SLIDER
// ============================================================

interEl.addEventListener(
    "input",
    (event) => {

        state.inter =
            (+event.target.value) /
            100;

        syncLabels();

    }
);


// ============================================================
// PRESET: THERMAL CLOUD
// ============================================================

$("presetHot").addEventListener(
    "click",
    () => {

        state.T = 480;

        tempEl.value = 480;

        syncLabels();

    }
);


// ============================================================
// PRESET: AT CRITICAL TEMPERATURE
// ============================================================

$("presetTc").addEventListener(
    "click",
    () => {

        const Tc =
            computeTc();


        state.T =
            Math.round(
                Math.min(
                    500,
                    Tc
                )
            );


        tempEl.value =
            state.T;


        syncLabels();

    }
);


// ============================================================
// PRESET: PURE CONDENSATE
// ============================================================

$("presetCold").addEventListener(
    "click",
    () => {

        state.T = 5;

        tempEl.value = 5;

        syncLabels();

    }
);


// ============================================================
// INITIALIZE
// ============================================================

fitAll();

syncLabels();

requestAnimationFrame(frame);
