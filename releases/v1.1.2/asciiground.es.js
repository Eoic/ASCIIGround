var M = Object.defineProperty;
var w = (c, e, t) => e in c ? M(c, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : c[e] = t;
var h = (c, e, t) => w(c, typeof e != "symbol" ? e + "" : e, t);
const R = {
  characters: ["█", "▓", "▒", "░", " "]
};
class p {
  constructor(e = {}) {
    /**
     * Options for the pattern, initialized with default values.
     */
    h(this, "_options");
    /**
     * Flag indicating if the pattern needs to be re-rendered.
     * This is set to true when pattern options change in a way that required re-render (e.g. color change).
     */
    h(this, "_isDirty", !1);
    this._options = { ...R, ...e };
  }
  get id() {
    return this.constructor.ID;
  }
  get options() {
    return this._options;
  }
  get isDirty() {
    return this._isDirty;
  }
  set isDirty(e) {
    this._isDirty = e;
  }
  /**
   * Update pattern options without recreating the pattern instance.
   * Override this method if your pattern has expensive initialization that should be preserved.
   * @param newOptions - partial options to update
   */
  setOptions(e) {
    this._isDirty = this._hasOptionsChanged(e), this._options = { ...this._options, ...e };
  }
  /**
   * Called when the pattern is initialized or resized.
   * Use this to set up any internal state or precompute values.
   * @param _region - the rendering region including visible area and padding.
   */
  initialize(e) {
  }
  /**
   * Called when the pattern is destroyed.
   * Use this to clean up resources, cancel timers, etc.
   */
  destroy() {
  }
  /**
   * Handle mouse interactions with the pattern.
   * Override to implement custom mouse effects.
   * @param _x - mouse X position relative to canvas.
   * @param _y - mouse Y position relative to canvas.
   * @param _clicked - Whether mouse was clicked this frame.
   */
  onMouseInteraction(e, t, i) {
  }
  /**
   * Check if the pattern options have changed.
   * @param options - new options to compare against current options.
   * @returns True if any options have changed, false otherwise.
   */
  _hasOptionsChanged(e) {
    return Object.keys(e).some((t) => {
      const i = this._options[t], s = e[t];
      return i !== s;
    });
  }
}
/**
 * Unique identifier for the pattern, that should be overridden in subclasses.
 */
h(p, "ID");
class D extends p {
  constructor(e = {}) {
    super(e);
  }
  update(e) {
    return this;
  }
  generate(e) {
    return [];
  }
}
h(D, "ID", "dummy");
class d {
  constructor() {
    h(this, "_canvas");
    h(this, "_context");
    h(this, "_options");
  }
  get options() {
    return this._options;
  }
  set options(e) {
    this._options = e, this._setupContext();
  }
  initialize(e, t) {
    this._canvas = e, this._options = t;
    const i = e.getContext("2d");
    if (!i)
      throw new Error("Could not get 2D context from canvas");
    this._context = i, this._setupContext();
  }
  clear(e) {
    this._context.fillStyle = e, this._context.fillRect(0, 0, this._canvas.width, this._canvas.height), this._context.fillStyle = this._options.color;
  }
  render(e, t) {
    const i = t.startColumn !== 0 || t.startRow !== 0 || t.endColumn !== t.columns || t.endRow !== t.rows;
    i && (this._context.save(), this._context.beginPath(), this._context.rect(
      t.startColumn * t.charSpacingX,
      t.startRow * t.charSpacingY,
      (t.endColumn - t.startColumn) * t.charSpacingX,
      (t.endRow - t.startRow) * t.charSpacingY
    ), this._context.clip());
    for (const s of e)
      s.x < 0 || s.x >= t.canvasWidth || s.y < 0 || s.y >= t.canvasHeight || (s.opacity !== void 0 && (this._context.globalAlpha = s.opacity), s.color && (this._context.fillStyle = s.color), s.scale !== void 0 || s.rotation !== void 0 ? (this._context.save(), this._context.translate(s.x + t.charWidth / 2, s.y + t.charHeight / 2), s.rotation !== void 0 && this._context.rotate(s.rotation), s.scale !== void 0 && this._context.scale(s.scale, s.scale), this._context.fillText(s.char, -t.charWidth / 2, -t.charHeight / 2), this._context.restore()) : this._context.fillText(s.char, s.x, s.y), s.opacity !== void 0 && (this._context.globalAlpha = 1), s.color && (this._context.fillStyle = this._options.color));
    i && this._context.restore();
  }
  resize(e, t) {
    this._canvas.width = e, this._canvas.height = t, this._setupContext();
  }
  destroy() {
  }
  _setupContext() {
    this._context.font = `${this._options.fontSize}px ${this._options.fontFamily}`, this._context.textBaseline = "top", this._context.fillStyle = this._options.color;
  }
}
class T {
  constructor() {
    h(this, "_gl");
    h(this, "_canvas");
    h(this, "_program");
    h(this, "_options");
    h(this, "_isInitialized", !1);
  }
  get options() {
    return this._options;
  }
  set options(e) {
    this._options = e;
  }
  initialize(e) {
    this._canvas = e;
    const t = e.getContext("webgl2");
    if (!t)
      throw new Error("Could not get WebGL2 context from canvas.");
    this._gl = t, this._setupWebGL(), this._isInitialized = !0;
  }
  clear(e) {
    if (!this._isInitialized)
      return;
    const t = this._gl, i = e.replace("#", ""), s = parseInt(i.substring(0, 2), 16) / 255, n = parseInt(i.substring(2, 4), 16) / 255, a = parseInt(i.substring(4, 6), 16) / 255;
    t.clearColor(s, n, a, 1), t.clear(t.COLOR_BUFFER_BIT);
  }
  render(e, t) {
    this._isInitialized;
  }
  resize(e, t) {
    this._isInitialized && (this._canvas.width = e, this._canvas.height = t, this._gl.viewport(0, 0, e, t));
  }
  destroy() {
    if (!this._isInitialized)
      return;
    const e = this._gl;
    this._program && e.deleteProgram(this._program), this._isInitialized = !1;
  }
  _setupWebGL() {
    const e = this._gl, t = `#version 300 es
            precision mediump float;
            
            in vec2 a_position;
            in vec2 a_texCoord;
            in float a_opacity;
            
            uniform vec2 u_resolution;
            uniform mat3 u_transform;
            
            out vec2 v_texCoord;
            out float v_opacity;
            
            void main() {
                vec3 position = u_transform * vec3(a_position, 1.0);
                vec2 clipSpace = ((position.xy / u_resolution) * 2.0 - 1.0) * vec2(1, -1);
                gl_Position = vec4(clipSpace, 0, 1);
                v_texCoord = a_texCoord;
                v_opacity = a_opacity;
            }
        `, i = `#version 300 es
            precision mediump float;
            
            in vec2 v_texCoord;
            in float v_opacity;
            
            uniform sampler2D u_texture;
            uniform vec3 u_color;
            
            out vec4 fragColor;
            
            void main() {
                float alpha = texture(u_texture, v_texCoord).r;
                fragColor = vec4(u_color, alpha * v_opacity);
            }
        `, s = this._createShader(e.VERTEX_SHADER, t), n = this._createShader(e.FRAGMENT_SHADER, i);
    if (this._program = e.createProgram(), e.attachShader(this._program, s), e.attachShader(this._program, n), e.linkProgram(this._program), !e.getProgramParameter(this._program, e.LINK_STATUS))
      throw new Error("Failed to link WebGL program: " + e.getProgramInfoLog(this._program));
    e.enable(e.BLEND), e.blendFunc(e.SRC_ALPHA, e.ONE_MINUS_SRC_ALPHA);
  }
  _createShader(e, t) {
    const i = this._gl, s = i.createShader(e);
    if (i.shaderSource(s, t), i.compileShader(s), !i.getShaderParameter(s, i.COMPILE_STATUS)) {
      const n = i.getShaderInfoLog(s);
      throw i.deleteShader(s), new Error(`Failed to compile shader: ${n}`);
    }
    return s;
  }
}
const I = (c) => {
  switch (c) {
    case "WebGL":
      if (typeof WebGL2RenderingContext < "u")
        try {
          return new T();
        } catch {
          return new d();
        }
      else
        return new d();
    case "2D":
      return new d();
    default:
      throw new Error("Unknown renderer type given!");
  }
}, x = {
  color: "#3e3e80ff",
  fontSize: 32,
  fontFamily: "monospace",
  backgroundColor: "#181818ff",
  padding: 0,
  rendererType: "2D",
  enableMouseInteraction: !1,
  animated: !1,
  animationSpeed: 1,
  charSpacingX: void 0,
  charSpacingY: void 0,
  resizeTo: window
}, C = () => ({
  canvas: null,
  renderer: null,
  pattern: null,
  region: null,
  options: x,
  lastTime: 0,
  animationId: null,
  animationTime: 0,
  mouseX: 0,
  mouseY: 0,
  mouseClicked: !1,
  tempCanvas: null,
  tempContext: null,
  lastHash: 0,
  isDirty: !0,
  resizeObserver: null
});
class A {
  /**
   * Create a new ASCIIRenderer instance.
   * @param options - the renderer constructor parameters.
   */
  constructor({ canvas: e, pattern: t, options: i }) {
    h(this, "_state", C());
    h(this, "_handleResize");
    /**
     * Handle mouse move events to update mouse position.
     * @param event Mouse event to handle.
     */
    h(this, "_mouseMoveHandler", (e) => {
      const t = this.canvas.getBoundingClientRect();
      this._state.mouseX = e.clientX - t.left, this._state.mouseY = e.clientY - t.top;
    });
    /**
     * Handle mouse click events to update clicked state.
     * This can be used by patterns to respond to user input.
     */
    h(this, "_mouseClickHandler", () => {
      this._state.mouseClicked = !0;
    });
    i || (i = {}), this._state.canvas = e, this._state.pattern = t || new D(), this._handleResize = this.resize.bind(this), this._state.options = {
      ...x,
      ...i
    }, this._state.renderer = I(this._state.options.rendererType || "2D"), this._state.region = this._calculateRegion(), this._setupRenderer(), this._state.options.enableMouseInteraction && this._setupMouseEvents();
  }
  /**
   * Get the current rendering options.
   * @returns The current ASCIIRendererOptions.
   */
  get options() {
    return this._state.options;
  }
  /** Get the current pattern generator. */
  get pattern() {
    if (!this._state.pattern)
      throw new Error("Pattern not initialized");
    return this._state.pattern;
  }
  /** Set a new pattern generator for the renderer. */
  set pattern(e) {
    this._state.pattern && this._state.pattern.destroy(), this._state.pattern = e, this._state.region && this._state.pattern.initialize(this._state.region), this._resetAnimationTime();
  }
  /** Whether the renderer is currently animating. */
  get isAnimating() {
    return this._state.options.animated;
  }
  /**
   * Get the canvas element, throwing an error if not initialized.
   */
  get canvas() {
    if (!this._state.canvas)
      throw new Error("Canvas not initialized.");
    return this._state.canvas;
  }
  /**
   * Get the real canvas size, accounting for padding and `resizeTo` target size.
   * This is used to ensure the canvas is sized correctly for rendering.
   */
  get realCanvasSize() {
    const e = this._state.options.resizeTo;
    if (e instanceof HTMLElement) {
      const t = window.getComputedStyle(e), i = parseFloat(t.paddingLeft) + parseFloat(t.paddingRight), s = parseFloat(t.paddingTop) + parseFloat(t.paddingBottom);
      return [e.clientWidth - i, e.clientHeight - s];
    }
    return [e.innerWidth, e.innerHeight];
  }
  /**
   * Get the renderer, throwing an error if not initialized.
   */
  get renderer() {
    if (!this._state.renderer)
      throw new Error("Renderer not initialized.");
    return this._state.renderer;
  }
  /**
   * Get the region, throwing an error if not calculated.
   */
  get region() {
    if (!this._state.region)
      throw new Error("Region not calculated.");
    return this._state.region;
  }
  /**
   * Get the temp context, ensuring it's initialized.
   */
  get tempContext() {
    if (!this._state.tempCanvas && (this._state.tempCanvas = document.createElement("canvas"), this._state.tempContext = this._state.tempCanvas.getContext("2d"), !this._state.tempContext))
      throw new Error("Failed to create 2D context for temp canvas");
    if (!this._state.tempContext)
      throw new Error("Temp context not initialized.");
    return this._state.tempContext;
  }
  /**
   * Render a single frame. This method updates the pattern state and renders characters to the canvas.
   * @param time - optional timestamp for the frame, defaults to `performance.now()`.
   */
  render(e = performance.now()) {
    const t = e - this._state.lastTime;
    this._state.lastTime = e, this._state.options.animated && (this._state.animationTime += t / 1e3 * this._state.options.animationSpeed);
    const i = {
      time: this._state.animationTime,
      deltaTime: t / 1e3,
      animationTime: this._state.animationTime,
      region: this.region,
      mouseX: this._state.mouseX,
      mouseY: this._state.mouseY,
      clicked: this._state.mouseClicked,
      isAnimating: this._state.options.animated,
      animationSpeed: this._state.options.animationSpeed
    };
    this._state.mouseClicked = !1;
    const s = this.pattern.update(i).generate(i);
    !this._hasOutputChanged(s) && !this._state.isDirty && !this.pattern.isDirty || (this.pattern.isDirty = !1, this._state.isDirty = !1, this._state.lastHash = this._hash(s), this.renderer.clear(this._state.options.backgroundColor), this.renderer.render(s, this.region));
  }
  /**
   * Start animation loop.
   */
  startAnimation() {
    if (this._state.animationId)
      throw new Error("Animation is already running!");
    this._state.options.animated = !0, this._state.lastTime = performance.now();
    const e = (t) => {
      this.isAnimating && (this.render(t), this._state.animationId = requestAnimationFrame(e));
    };
    this._state.animationId = requestAnimationFrame(e);
  }
  /**
   * Stop animation loop.
   */
  stopAnimation() {
    this._state.options.animated = !1, this._state.animationId !== null && (cancelAnimationFrame(this._state.animationId), this._state.animationId = null);
  }
  /**
   * Update rendering options.
   */
  setOptions(e) {
    const t = this._state.options;
    this._state.options = { ...t, ...e }, this._state.isDirty = this._hasOptionsChanged(t), this._state.region = this._calculateRegion(), this.pattern.initialize(this._state.region), this.renderer.options = this._state.options, this._syncAnimationState();
  }
  /**
   * Resize the canvas and recalculate layout.
   */
  resize() {
    [this.canvas.width, this.canvas.height] = this.realCanvasSize, this._state.region = this._calculateRegion(), this.renderer.resize(this.canvas.width, this.canvas.height), this.pattern.initialize(this._state.region), this.isAnimating || (this._state.isDirty = !0, this.render());
  }
  /**
   * Cleanup resources and stop animation.
   */
  destroy() {
    this.stopAnimation(), this._state.pattern?.destroy(), this._state.renderer?.destroy(), this._state.canvas?.removeEventListener("mousemove", this._mouseMoveHandler), this._state.canvas?.removeEventListener("click", this._mouseClickHandler), this._state.options.resizeTo.removeEventListener("resize", this._handleResize), this._state.resizeObserver?.disconnect(), this._state = C();
  }
  /**
   * Calculate character spacing based on font metrics.
   * @returns A tuple containing the character width, height, and spacing sizes.
   */
  _calculateSpacing() {
    let e = 0;
    for (const r of this.pattern.options.characters) {
      const _ = this.tempContext.measureText(r);
      e = Math.max(e, _.width);
    }
    const t = e, i = this.tempContext.measureText(this.pattern.options.characters.join("")), s = i.actualBoundingBoxAscent + i.actualBoundingBoxDescent, n = Math.max(s, this._state.options.fontSize), a = this._state.options.charSpacingX && this._state.options.charSpacingX > 0 ? this._state.options.charSpacingX : t, o = this._state.options.charSpacingY && this._state.options.charSpacingY > 0 ? this._state.options.charSpacingY : Math.max(n, this._state.options.fontSize * 1.2);
    return [t, n, a, o];
  }
  /**
   * Calculate the rendering region based on canvas size and options.
   * @returns The calculated RenderRegion object.
   */
  _calculateRegion() {
    this.tempContext.font = `${this._state.options.fontSize}px ${this._state.options.fontFamily}`;
    const [e, t, i, s] = this._calculateSpacing(), n = Math.floor(this.canvas.width / i), a = Math.floor(this.canvas.height / s);
    return {
      startColumn: this._state.options.padding,
      endColumn: n - this._state.options.padding,
      startRow: this._state.options.padding,
      endRow: a - this._state.options.padding,
      columns: n,
      rows: a,
      charWidth: e,
      charHeight: t,
      charSpacingX: i,
      charSpacingY: s,
      canvasWidth: this.canvas.width,
      canvasHeight: this.canvas.height
    };
  }
  /**
   * Initialize the renderer with the canvas and options.
   * This sets up the rendering context and prepares for rendering.
   */
  _setupRenderer() {
    [this.canvas.width, this.canvas.height] = this.realCanvasSize, this.renderer.initialize(this.canvas, this._state.options), this.pattern.initialize(this.region), this._state.options.resizeTo instanceof HTMLElement ? (this._state.resizeObserver = new ResizeObserver(this._handleResize), this._state.resizeObserver.observe(this._state.options.resizeTo)) : this._state.options.resizeTo.addEventListener("resize", this._handleResize);
  }
  /**
   * Setup mouse event listeners for interaction.
   * This allows patterns to respond to mouse movements and clicks.
   */
  _setupMouseEvents() {
    this.canvas.addEventListener("mousemove", this._mouseMoveHandler), this.canvas.addEventListener("click", this._mouseClickHandler);
  }
  /**
   * Reset the animation time to zero.
   * Useful when restarting animations or switching patterns.
   */
  _resetAnimationTime() {
    this._state.animationTime = 0;
  }
  /**
   * Synchronize animation state with the current options.
   * This ensures that the renderer reflects the current animation settings.
   */
  _syncAnimationState() {
    this._state.options.animated && this._state.animationId === null ? this.startAnimation() : !this._state.options.animated && this._state.animationId !== null && this.stopAnimation();
  }
  /**
   * Generate a hash for the current character data list.
   * @param list - the character data list to hash.
   * @returns A numeric hash value.
   */
  _hash(e) {
    let t = 0;
    for (const { x: i, y: s, char: n, color: a = "", opacity: o = 1, scale: r = 1, rotation: _ = 0 } of e)
      t ^= (i * 31 + s * 17 ^ n.charCodeAt(0)) + (a.charCodeAt(0) || 0) * 13 + Math.floor(o * 100) * 7 + Math.floor(r * 100) * 5 + Math.floor(_ * 100) * 3;
    return t;
  }
  /**
   * Check if the output has changed since the last render.
   * This is used to avoid unnecessary rendering when nothing has changed.
   * @param list - the current character data list.
   * @returns True if the output has changed, false otherwise.
   */
  _hasOutputChanged(e) {
    return this._hash(e) !== this._state.lastHash;
  }
  /**
   * Check if the new options differ from the current ones.
   * @param options - the options to compare against current options.
   * @returns True if any option has changed, false otherwise.
   */
  _hasOptionsChanged(e) {
    return Object.keys(e).some((t) => {
      const i = this._state.options[t], s = e[t];
      return i !== s;
    });
  }
}
const y = (c) => {
  let e = c === 0 ? 1 : c;
  return () => (e = e * 16807 % 2147483647, e / 2147483647);
}, z = {
  frequency: 0.01,
  octaves: 4,
  persistence: 0.5,
  lacunarity: 2,
  seed: 0
};
class b extends p {
  constructor(t = {}) {
    super({ ...z, ...t });
    /**
     * Stores a permutation table used for generating Perlin noise.
     * This array contains a shuffled sequence of numbers and is used to
     * determine gradient directions and hashing in algorithm.
     */
    h(this, "_permutations");
    this._permutations = this._generatePermutations(this._options.seed);
  }
  get _frequency() {
    return this._options.frequency;
  }
  get _octaves() {
    return this._options.octaves;
  }
  get _persistence() {
    return this._options.persistence;
  }
  get _lacunarity() {
    return this._options.lacunarity;
  }
  /**
   * Update options while preserving expensive permutation table when possible.
   */
  setOptions(t) {
    const i = this._options.seed;
    super.setOptions(t), t.seed !== void 0 && t.seed !== i && (this._permutations = this._generatePermutations(this._options.seed));
  }
  update(t) {
    return this;
  }
  /**
   * Generate characters for the current frame using Perlin noise.
   * @param context - the current rendering context with time and region info
   * @returns Array of character data for rendering
   */
  generate({ animationTime: t, region: i }) {
    if (this.options.characters.length === 0)
      return [];
    const s = [];
    for (let n = i.startRow; n <= i.endRow; n++)
      for (let a = i.startColumn; a <= i.endColumn; a++) {
        const o = this._fractalNoise(
          a * this._options.frequency,
          n * this._options.frequency,
          t * 1e-3
        ), r = Math.max(0, Math.min(1, (o + 1) / 2)), _ = Math.floor(r * this._options.characters.length), l = Math.max(0, Math.min(_, this._options.characters.length - 1));
        s.push({
          char: this._options.characters[l],
          x: a * i.charSpacingX,
          y: n * i.charSpacingY,
          opacity: r
        });
      }
    return s;
  }
  /**
   * Generate a proper permutation table for Perlin noise.
   */
  _generatePermutations(t) {
    const i = y(t), s = Array.from({ length: 256 }, (n, a) => a);
    for (let n = 255; n > 0; n--) {
      const a = Math.floor(i() * (n + 1)), o = s[n];
      s[n] = s[a], s[a] = o;
    }
    return s.concat(s);
  }
  /**
   * Fade function for smooth interpolation.
   */
  _fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }
  /**
   * Linear interpolation.
   */
  _lerp(t, i, s) {
    return t + s * (i - t);
  }
  /**
   * 3D gradient function.
   */
  _gradient3D(t, i, s, n) {
    const a = t & 15, o = a < 8 ? i : s, r = a < 4 ? s : a === 12 || a === 14 ? i : n;
    return ((a & 1) === 0 ? o : -o) + ((a & 2) === 0 ? r : -r);
  }
  /**
   * Generate 3D Perlin noise at given coordinates.
   */
  _noise3D(t, i, s) {
    const n = Math.floor(t) & 255, a = Math.floor(i) & 255, o = Math.floor(s) & 255;
    t -= Math.floor(t), i -= Math.floor(i), s -= Math.floor(s);
    const r = this._fade(t), _ = this._fade(i), l = this._fade(s), u = this._permutations[n] + a & 255, m = this._permutations[u] + o & 255, g = this._permutations[u + 1 & 255] + o & 255, f = this._permutations[n + 1 & 255] + a & 255, v = this._permutations[f] + o & 255, S = this._permutations[f + 1 & 255] + o & 255;
    return this._lerp(
      this._lerp(
        this._lerp(
          this._gradient3D(this._permutations[m], t, i, s),
          this._gradient3D(this._permutations[v], t - 1, i, s),
          r
        ),
        this._lerp(
          this._gradient3D(this._permutations[g], t, i - 1, s),
          this._gradient3D(this._permutations[S], t - 1, i - 1, s),
          r
        ),
        _
      ),
      this._lerp(
        this._lerp(
          this._gradient3D(this._permutations[m + 1 & 255], t, i, s - 1),
          this._gradient3D(this._permutations[v + 1 & 255], t - 1, i, s - 1),
          r
        ),
        this._lerp(
          this._gradient3D(this._permutations[g + 1 & 255], t, i - 1, s - 1),
          this._gradient3D(this._permutations[S + 1 & 255], t - 1, i - 1, s - 1),
          r
        ),
        _
      ),
      l
    );
  }
  /**
   * Generate fractal noise using multiple octaves.
   * This creates more natural-looking, organic patterns.
   */
  _fractalNoise(t, i, s = 0) {
    let n = 0, a = 0, o = 1, r = 1;
    for (let _ = 0; _ < this._octaves; _++)
      n += this._noise3D(
        t * r,
        i * r,
        s * r
      ) * o, a += o, o *= this._persistence, r *= this._lacunarity;
    return n / a;
  }
  /**
   * Generate animated noise that changes over time.
   * This creates flowing, organic motion patterns.
   */
  _animatedNoise(t, i, s) {
    const a = this._frequency, o = this._fractalNoise(
      t * a,
      i * a,
      s * 0.01
    ), r = this._fractalNoise(
      (t + 1e3) * a,
      (i + 1e3) * a,
      s * 0.01 * 0.8
    );
    return (o + r * 0.5) / 1.5;
  }
  /**
   * Generate a noise function suitable for ASCII pattern generation.
   */
  _getNoiseFunction(t = "down") {
    return (i, s, n) => {
      let a = i, o = s;
      const r = n;
      switch (t) {
        case "left":
          a = i + n * 0.5;
          break;
        case "right":
          a = i - n * 0.5;
          break;
        case "up":
          o = s + n * 0.5;
          break;
        case "down":
          o = s - n * 0.5;
          break;
      }
      return this._animatedNoise(a, o, r);
    };
  }
}
h(b, "ID", "perlin-noise");
const E = {
  rainDensity: 0.8,
  minDropLength: 8,
  maxDropLength: 25,
  minSpeed: 0.5,
  maxSpeed: 1.5,
  mutationRate: 0.04,
  fadeOpacity: 0.2,
  headColor: "#FFFFFF"
};
class L extends p {
  constructor(t = {}) {
    super({ ...E, ...t });
    h(this, "_rainDrops", []);
    h(this, "_region", null);
    h(this, "_lastFrameCharacters", []);
  }
  initialize(t) {
    const i = this._rainDrops.length > 0, s = this._region;
    this._region = t, !i || !s || Math.abs(s.columns - t.columns) > 2 || Math.abs(s.rows - t.rows) > 2 ? (this._rainDrops = [], this._lastFrameCharacters = [], this._initializeRainDrops()) : (this._adjustDropsToNewRegion(s, t), this._maintainRainDensity());
  }
  update(t) {
    return this._region ? (this._updateRainDrops(t), this._maintainRainDensity(), this) : this;
  }
  generate(t) {
    if ((!this._region || this._rainDrops.length === 0) && (this._region && this._rainDrops.length === 0 && this._initializeRainDrops(), this._rainDrops.length === 0))
      return [];
    const i = [];
    if (this._options.fadeOpacity > 0)
      for (const s of this._lastFrameCharacters)
        i.push({ ...s, opacity: this._options.fadeOpacity });
    for (const s of this._rainDrops)
      this._renderRainDrop(s, i, t);
    return this._lastFrameCharacters = i.filter((s) => s.opacity !== this._options.fadeOpacity), i;
  }
  _initializeRainDrops() {
    if (!this._region)
      return;
    const t = Math.floor(this._region.columns * this._options.rainDensity), i = Math.max(1, t);
    for (let s = 0; s < i; s++) {
      const n = Math.floor(Math.random() * this._region.columns) + this._region.startColumn, a = this._createRainDrop(n, 0);
      s < Math.max(1, Math.floor(i * 0.3)) && (a.y = Math.random() * this._region.rows), this._rainDrops.push(a);
    }
  }
  _createRainDrop(t, i = 0) {
    const s = Math.floor(
      Math.random() * (this._options.maxDropLength - this._options.minDropLength)
    ) + this._options.minDropLength, n = Array.from(
      { length: s },
      () => this._options.characters[Math.floor(Math.random() * this._options.characters.length)]
    );
    return {
      y: -Math.floor(Math.random() * s) - Math.random() * 10,
      column: t,
      length: s,
      characters: n,
      lastMutationTime: i,
      speed: Math.random() * (this._options.maxSpeed - this._options.minSpeed) + this._options.minSpeed
    };
  }
  _updateRainDrops(t) {
    if (this._region)
      for (const i of this._rainDrops) {
        if (t.isAnimating && (i.y += i.speed * t.animationSpeed * t.deltaTime), t.animationTime - i.lastMutationTime > 1 / this._options.mutationRate && Math.random() < this._options.mutationRate) {
          const s = Math.floor(Math.random() * i.length);
          i.characters[s] = this._options.characters[Math.floor(Math.random() * this._options.characters.length)], i.lastMutationTime = t.animationTime;
        }
        i.y - i.length > this._region.endRow && this._resetRainDrop(i, t.animationTime);
      }
  }
  _resetRainDrop(t, i) {
    this._region && (t.lastMutationTime = i, t.y = -Math.floor(Math.random() * 8) - t.length, t.length = Math.floor(
      Math.random() * (this._options.maxDropLength - this._options.minDropLength)
    ) + this._options.minDropLength, t.characters = Array.from(
      { length: t.length },
      () => this._options.characters[Math.floor(Math.random() * this._options.characters.length)]
    ), t.speed = Math.random() * (this._options.maxSpeed - this._options.minSpeed) + this._options.minSpeed, t.column = Math.floor(Math.random() * this._region.columns) + this._region.startColumn);
  }
  _maintainRainDensity() {
    if (!this._region)
      return;
    const t = Math.floor(this._region.columns * this._options.rainDensity);
    for (; this._rainDrops.length < t; ) {
      const i = this._rainDrops.length % this._region.columns + this._region.startColumn, s = this._createRainDrop(i, 0);
      Math.random() < 0.4 && (s.y = Math.random() * this._region.rows + this._region.startRow), this._rainDrops.push(s);
    }
    this._rainDrops.length > t && (this._rainDrops.length = t);
  }
  /**
   * Adjust existing drops to fit a new region without losing current state.
   */
  _adjustDropsToNewRegion(t, i) {
    for (const s of this._rainDrops)
      s.column >= i.startColumn + i.columns ? s.column = s.column % i.columns + i.startColumn : s.column < i.startColumn && (s.column = i.startColumn);
  }
  _renderRainDrop(t, i, s) {
    if (this._region)
      for (let n = 0; n < t.length; n++) {
        const a = Math.floor(t.y) - n;
        if (a < this._region.startRow || a > this._region.endRow || t.column < this._region.startColumn || t.column > this._region.endColumn)
          continue;
        const o = t.column * this._region.charSpacingX, r = a * this._region.charSpacingY;
        let _, l = 1;
        n === 0 ? _ = this._options.headColor : n >= 3 && (l = 1 - n / t.length), i.push({
          x: o,
          y: r,
          color: _,
          opacity: l,
          char: t.characters[n]
        });
      }
  }
  destroy() {
    this._rainDrops = [], this._lastFrameCharacters = [], this._region = null;
  }
  setOptions(t) {
    if (super.setOptions(t), t.rainDensity !== void 0 && this._region && this._maintainRainDensity(), t.characters !== void 0)
      for (const i of this._rainDrops)
        i.characters = Array.from(
          { length: i.length },
          () => this._options.characters[Math.floor(Math.random() * this._options.characters.length)]
        );
  }
}
h(L, "ID", "rain");
const O = {
  seed: 0
};
class F extends p {
  constructor(e = {}) {
    super({ ...O, ...e });
  }
  update(e) {
    return this;
  }
  generate({ region: e, animationTime: t }) {
    const i = [], s = y(this._options.seed + Math.floor(t * 10));
    for (let n = e.startRow; n <= e.endRow; n++)
      for (let a = e.startColumn; a <= e.endColumn; a++) {
        const o = Math.floor(s() * this._options.characters.length), r = this._options.characters[o] || " ";
        i.push({
          char: r,
          x: a * e.charSpacingX,
          y: n * e.charSpacingY
        });
      }
    return i;
  }
}
h(F, "ID", "static");
class P {
  constructor() {
    h(this, "_renderer", null);
  }
  get pattern() {
    return this.renderer.pattern;
  }
  get options() {
    return Object.freeze(this.renderer.options);
  }
  get renderer() {
    if (!this._renderer)
      throw new Error("Renderer is not initialized - call init() first.");
    return this._renderer;
  }
  set renderer(e) {
    this._renderer = e;
  }
  /**
   * Initialize the ASCIIGround instance with a canvas, a pattern and renderer options.
   * @param canvas - The HTML canvas element to render on.
   * @param pattern - The pattern to use for rendering.
   * @param options - Optional renderer options.
   */
  init(e, t, i) {
    return this.renderer = new A({ canvas: e, pattern: t, options: i }), this;
  }
  /**
   * Start the animation.
   * @returns The current ASCIIGround instance.
   */
  startAnimation() {
    return this.renderer.startAnimation(), this;
  }
  /**
   * Stop the animation.
   * @returns The current ASCIIGround instance.
   */
  stopAnimation() {
    return this.renderer.stopAnimation(), this;
  }
  /**
   * Set a new pattern generator for the renderer.
   * @param pattern - The new pattern to set.
   * @returns The current ASCIIGround instance.
   */
  setPattern(e) {
    return this.renderer.pattern = e, this;
  }
  /**
   * Set new options for the renderer.
   * @param options - The new options to set.
   * @returns The current ASCIIGround instance.
   */
  setOptions(e) {
    return this.renderer.setOptions(e), this;
  }
  /**
   * Destroy the ASCIIGround instance, cleaning up resources.
   * This will stop the animation and nullify the renderer.
   */
  destroy() {
    this.renderer.destroy(), this.renderer = null;
  }
}
export {
  P as ASCIIGround,
  A as ASCIIRenderer,
  d as Canvas2DRenderer,
  D as DummyPattern,
  p as Pattern,
  b as PerlinNoisePattern,
  L as RainPattern,
  F as StaticNoisePattern,
  T as WebGLRenderer,
  I as createRenderer,
  y as createSeededRandom,
  P as default
};
