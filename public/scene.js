"use strict";
// A small, dependency-free WebGL scene: three textured draft planes orbiting
// in depth. Falls back to the CSS stack in app.css when WebGL is unavailable,
// the context is lost, or the visitor prefers reduced motion.
(() => {
  const canvas = document.getElementById("scene");
  const stage = canvas && canvas.closest("[data-scene]");
  if (!canvas || !stage) return;
  const gl =
    canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
    }) || canvas.getContext("experimental-webgl");
  if (!gl) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const narrow = window.matchMedia("(max-width: 760px)");
  const cards = [
    {
      label: "STEP 01 · REVIEW",
      title: "Feedback in",
      lines: ["Add a review you are", "authorized to manage."],
      chip: "You control the source",
      dark: false,
    },
    {
      label: "STEP 02 · DRAFT",
      title: "Reply prepared",
      lines: ["English template first.", "Optional AI, off by default."],
      chip: "Edit every word",
      dark: false,
    },
    {
      label: "STEP 03 · APPROVED",
      title: "Your final text",
      lines: ["Compare, edit, approve,", "then copy it yourself."],
      chip: "Nothing posts automatically",
      dark: true,
    },
  ];

  const vert = `attribute vec3 aPos;attribute vec2 aUv;uniform mat4 uProj;uniform mat4 uModel;varying vec2 vUv;void main(){vUv=aUv;gl_Position=uProj*uModel*vec4(aPos,1.0);}`;
  const frag = `precision mediump float;uniform sampler2D uTex;uniform float uOpacity;varying vec2 vUv;void main(){vec4 c=texture2D(uTex,vUv);if(c.a<0.02)discard;gl_FragColor=vec4(c.rgb,c.a*uOpacity);}`;

  function shader(type, source) {
    const item = gl.createShader(type);
    gl.shaderSource(item, source);
    gl.compileShader(item);
    if (!gl.getShaderParameter(item, gl.COMPILE_STATUS)) return null;
    return item;
  }
  const vs = shader(gl.VERTEX_SHADER, vert);
  const fs = shader(gl.FRAGMENT_SHADER, frag);
  if (!vs || !fs) return;
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);

  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      -0.5, -0.5, 0, 0, 1, 0.5, -0.5, 0, 1, 1, -0.5, 0.5, 0, 0, 0, 0.5, 0.5, 0,
      1, 0,
    ]),
    gl.STATIC_DRAW,
  );
  const aPos = gl.getAttribLocation(program, "aPos");
  const aUv = gl.getAttribLocation(program, "aUv");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 20, 0);
  gl.enableVertexAttribArray(aUv);
  gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 20, 12);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.disable(gl.DEPTH_TEST);
  gl.clearColor(0, 0, 0, 0);

  const uProj = gl.getUniformLocation(program, "uProj");
  const uModel = gl.getUniformLocation(program, "uModel");
  const uTex = gl.getUniformLocation(program, "uTex");
  const uOpacity = gl.getUniformLocation(program, "uOpacity");

  function rounded(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawCard(card) {
    const W = 1024;
    const H = 512;
    const surface = document.createElement("canvas");
    surface.width = W;
    surface.height = H;
    const ctx = surface.getContext("2d");
    if (!ctx) return null;
    const ink = card.dark ? "#f7f4ec" : "#111110";
    const muted = card.dark ? "#b9b2a4" : "#5c5a54";
    const line = card.dark ? "#3a3830" : "#ded8cb";
    const bg = card.dark ? "#111110" : "#fffefb";

    ctx.clearRect(0, 0, W, H);
    rounded(ctx, 16, 16, 992, 480, 32);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.save();
    rounded(ctx, 16, 16, 992, 480, 32);
    ctx.clip();
    ctx.fillStyle = "#ff6600";
    ctx.fillRect(16, 16, 992, 12);
    ctx.strokeStyle = line;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(820, 78);
    ctx.lineTo(940, 78);
    ctx.moveTo(820, 100);
    ctx.lineTo(908, 100);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = "#b23a00";
    if (card.dark) ctx.fillStyle = "#ff9b5e";
    ctx.font = '600 22px ui-monospace, "Cascadia Mono", Consolas, monospace';
    ctx.letterSpacing = "2px";
    ctx.fillText(card.label, 60, 92);

    ctx.fillStyle = ink;
    ctx.font = '700 62px "Space Grotesk", system-ui, sans-serif';
    ctx.letterSpacing = "-2px";
    ctx.fillText(card.title, 58, 196);

    ctx.fillStyle = muted;
    ctx.font = '400 27px system-ui, -apple-system, "Segoe UI", sans-serif';
    ctx.letterSpacing = "0px";
    card.lines.forEach((text, index) => {
      ctx.fillText(text, 60, 262 + index * 38);
    });

    ctx.fillStyle = "#ff6600";
    ctx.beginPath();
    ctx.arc(64, 434, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = muted;
    ctx.font = '600 20px ui-monospace, "Cascadia Mono", Consolas, monospace';
    ctx.letterSpacing = "1px";
    ctx.fillText(card.chip.toUpperCase(), 84, 441);

    ctx.strokeStyle = line;
    ctx.lineWidth = 2;
    rounded(ctx, 17, 17, 990, 478, 31);
    ctx.stroke();
    return surface;
  }

  function makeTexture(image) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    // The card surface is 1024x512 (both powers of two), so WebGL 1 can build
    // mipmaps and keep the small type crisp at every stage size.
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR_MIPMAP_LINEAR,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return texture;
  }
  function buildTextures() {
    return cards.map((card) => {
      const image = drawCard(card);
      return image ? makeTexture(image) : null;
    });
  }
  let textures = buildTextures();
  if (document.fonts && document.fonts.load)
    document.fonts
      .load('700 74px "Space Grotesk"')
      .then(() => {
        textures = buildTextures();
        render(0.35);
      })
      .catch(() => {});

  function perspective(fov, aspect, near, far) {
    const f = 1 / Math.tan(fov / 2);
    const out = new Float32Array(16);
    out[0] = f / aspect;
    out[5] = f;
    out[10] = (far + near) / (near - far);
    out[11] = -1;
    out[14] = (2 * far * near) / (near - far);
    return out;
  }
  function model(tx, ty, tz, ry, rx, sx, sy) {
    const cy = Math.cos(ry),
      sy_ = Math.sin(ry),
      cx = Math.cos(rx),
      sx_ = Math.sin(rx);
    const out = new Float32Array(16);
    out[0] = cy * sx;
    out[1] = 0;
    out[2] = -sy_ * sx;
    out[3] = 0;
    out[4] = sy_ * sx_ * sy;
    out[5] = cx * sy;
    out[6] = cy * sx_ * sy;
    out[7] = 0;
    out[8] = sy_ * cx * 1;
    out[9] = -sx_ * 1;
    out[10] = cy * cx * 1;
    out[11] = 0;
    out[12] = tx;
    out[13] = ty;
    out[14] = tz;
    out[15] = 1;
    return out;
  }

  let width = 0,
    height = 0,
    dpr = 1;
  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return false;
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const nextW = Math.round(rect.width * dpr);
    const nextH = Math.round(rect.height * dpr);
    if (nextW === width && nextH === height) return true;
    width = nextW;
    height = nextH;
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
    return true;
  }

  let visible = true;
  let frame = 0;
  let stopped = false;
  // Each card keeps a station in a shallow staircase so all three steps stay
  // readable: upper-left, center, lower-right. Motion is a restrained drift,
  // not an orbit.
  const stations = [
    { x: -0.74, y: 0.62, z: -4.3, ry: 0.16, rx: 0.05 },
    { x: 0, y: 0, z: -4.15, ry: 0, rx: 0.04 },
    { x: 0.74, y: -0.62, z: -4.0, ry: -0.16, rx: 0.03 },
  ];
  function render(time) {
    if (!resize()) return;
    const aspect = width / Math.max(1, height);
    const projection = perspective((42 * Math.PI) / 180, aspect, 0.1, 30);
    const t = time / 1000;
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.uniformMatrix4fv(uProj, false, projection);
    const order = stations.map((station, index) => {
      const drift = index * 1.9;
      return {
        index,
        s: station,
        z: station.z + Math.sin(t * 0.34 + drift) * 0.06,
        x: station.x + Math.sin(t * 0.42 + drift) * 0.03,
        y: station.y + Math.cos(t * 0.31 + drift) * 0.04,
        ry: station.ry + Math.sin(t * 0.28 + drift) * 0.03,
      };
    });
    order.sort((a, b) => a.z - b.z);
    for (const item of order) {
      const texture = textures[item.index];
      if (!texture) continue;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(uTex, 0);
      gl.uniform1f(uOpacity, 1);
      gl.uniformMatrix4fv(
        uModel,
        false,
        model(
          item.x,
          item.y,
          item.z,
          item.ry,
          item.s.rx,
          1.44,
          0.72,
        ),
      );
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  }

  function loop(now) {
    if (stopped) return;
    if (visible && !reduced.matches) render(now);
    frame = window.requestAnimationFrame(loop);
  }

  function start() {
    if (stopped || narrow.matches) return;
    if (reduced.matches) {
      render(900);
      return;
    }
    if (!frame) frame = window.requestAnimationFrame(loop);
  }
  function stop() {
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
  }

  if (!resize()) {
    window.addEventListener("resize", () => resize(), { passive: true });
  }
  stage.classList.remove("scene-live");
  function applyMode() {
    if (narrow.matches) {
      stop();
      stage.classList.remove("scene-live");
      return;
    }
    stage.classList.add("scene-live");
    if (!frame) start();
  }
  applyMode();
  narrow.addEventListener?.("change", applyMode);
  if (window.IntersectionObserver) {
    new IntersectionObserver(
      (entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
        if (!visible) stop();
        else if (!frame) start();
      },
      { rootMargin: "120px" },
    ).observe(canvas);
  }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else if (!frame) start();
  });
  reduced.addEventListener?.("change", () => {
    stop();
    start();
  });
  window.addEventListener("resize", () => {
    resize();
    if (reduced.matches) render(900);
  });
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    stopped = true;
    stop();
    stage.classList.remove("scene-live");
  });
  start();
})();
