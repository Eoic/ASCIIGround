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
  onMouseInteraction(e, t, s) {
  }
  /**
   * Check if the pattern options have changed.
   * @param options - new options to compare against current options.
   * @returns True if any options have changed, false otherwise.
   */
  _hasOptionsChanged(e) {
    return Object.keys(e).some((t) => {
      const s = this._options[t], i = e[t];
      return s !== i;
    });
  }
}
/**
 * Unique identifier for the pattern, that should be overridden in subclasses.
 */
h(p, "ID");
class C extends p {
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
h(C, "ID", "dummy");
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
    const s = e.getContext("2d");
    if (!s)
      throw new Error("Could not get 2D context from canvas");
    this._context = s, this._setupContext();
  }
  clear(e) {
    this._context.fillStyle = e, this._context.fillRect(0, 0, this._canvas.width, this._canvas.height), this._context.fillStyle = this._options.color;
  }
  render(e, t) {
    const s = t.startColumn !== 0 || t.startRow !== 0 || t.endColumn !== t.columns || t.endRow !== t.rows;
    s && (this._context.save(), this._context.beginPath(), this._context.rect(
      t.startColumn * t.charSpacingX,
      t.startRow * t.charSpacingY,
      (t.endColumn - t.startColumn) * t.charSpacingX,
      (t.endRow - t.startRow) * t.charSpacingY
    ), this._context.clip());
    for (const i of e)
      i.x < 0 || i.x >= t.canvasWidth || i.y < 0 || i.y >= t.canvasHeight || (i.opacity !== void 0 && (this._context.globalAlpha = i.opacity), i.color && (this._context.fillStyle = i.color), i.scale !== void 0 || i.rotation !== void 0 ? (this._context.save(), this._context.translate(i.x + t.charWidth / 2, i.y + t.charHeight / 2), i.rotation !== void 0 && this._context.rotate(i.rotation), i.scale !== void 0 && this._context.scale(i.scale, i.scale), this._context.fillText(i.char, -t.charWidth / 2, -t.charHeight / 2), this._context.restore()) : this._context.fillText(i.char, i.x, i.y), i.opacity !== void 0 && (this._context.globalAlpha = 1), i.color && (this._context.fillStyle = this._options.color));
    s && this._context.restore();
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
    const t = this._gl, s = e.replace("#", ""), i = parseInt(s.substring(0, 2), 16) / 255, n = parseInt(s.substring(2, 4), 16) / 255, a = parseInt(s.substring(4, 6), 16) / 255;
    t.clearColor(i, n, a, 1), t.clear(t.COLOR_BUFFER_BIT);
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
        `, s = `#version 300 es
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
        `, i = this._createShader(e.VERTEX_SHADER, t), n = this._createShader(e.FRAGMENT_SHADER, s);
    if (this._program = e.createProgram(), e.attachShader(this._program, i), e.attachShader(this._program, n), e.linkProgram(this._program), !e.getProgramParameter(this._program, e.LINK_STATUS))
      throw new Error("Failed to link WebGL program: " + e.getProgramInfoLog(this._program));
    e.enable(e.BLEND), e.blendFunc(e.SRC_ALPHA, e.ONE_MINUS_SRC_ALPHA);
  }
  _createShader(e, t) {
    const s = this._gl, i = s.createShader(e);
    if (s.shaderSource(i, t), s.compileShader(i), !s.getShaderParameter(i, s.COMPILE_STATUS)) {
      const n = s.getShaderInfoLog(i);
      throw s.deleteShader(i), new Error(`Failed to compile shader: ${n}`);
    }
    return i;
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
}, S = () => ({
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
   * Create a new ASCII renderer.
   * @param canvas - the canvas element to render to.
   * @param pattern - the pattern generator to use.
   * @param options - rendering options.
   */
  constructor(e, t, s = {}) {
    h(this, "_state", S());
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
    this._state.canvas = e, this._state.pattern = t || new C(), this._handleResize = this.resize.bind(this), this._state.options = {
      ...x,
      ...s
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
  get resizeDimensions() {
    const e = this._state.options.resizeTo;
    return e instanceof HTMLElement ? [e.clientWidth, e.clientHeight] : [e.innerWidth, e.innerHeight];
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
   * Render a single frame.
   */
  render(e = performance.now()) {
    const t = e - this._state.lastTime;
    this._state.lastTime = e, this._state.options.animated && (this._state.animationTime += t / 1e3 * this._state.options.animationSpeed);
    const s = {
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
    const i = this.pattern.update(s).generate(s);
    !this._hasOutputChanged(i) && !this._state.isDirty && !this.pattern.isDirty || (this.pattern.isDirty = !1, this._state.isDirty = !1, this._state.lastHash = this._hash(i), this.renderer.clear(this._state.options.backgroundColor), this.renderer.render(i, this.region));
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
    [this.canvas.width, this.canvas.height] = this.resizeDimensions, this._state.region = this._calculateRegion(), this.renderer.resize(this.canvas.width, this.canvas.height), this.pattern.initialize(this._state.region), this.isAnimating || (this._state.isDirty = !0, this.render());
  }
  /**
   * Cleanup resources and stop animation.
   */
  destroy() {
    this.stopAnimation(), this._state.pattern?.destroy(), this._state.renderer?.destroy(), this._state.canvas?.removeEventListener("mousemove", this._mouseMoveHandler), this._state.canvas?.removeEventListener("click", this._mouseClickHandler), this._state.options.resizeTo.removeEventListener("resize", this._handleResize), this._state.resizeObserver?.disconnect(), this._state = S();
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
    const t = e, s = this.tempContext.measureText(this.pattern.options.characters.join("")), i = s.actualBoundingBoxAscent + s.actualBoundingBoxDescent, n = Math.max(i, this._state.options.fontSize), a = this._state.options.charSpacingX && this._state.options.charSpacingX > 0 ? this._state.options.charSpacingX : t, o = this._state.options.charSpacingY && this._state.options.charSpacingY > 0 ? this._state.options.charSpacingY : Math.max(n, this._state.options.fontSize * 1.2);
    return [t, n, a, o];
  }
  /**
   * Calculate the rendering region based on canvas size and options.
   * @returns The calculated RenderRegion object.
   */
  _calculateRegion() {
    this.tempContext.font = `${this._state.options.fontSize}px ${this._state.options.fontFamily}`;
    const [e, t, s, i] = this._calculateSpacing(), n = Math.floor(this.canvas.width / s), a = Math.floor(this.canvas.height / i);
    return {
      startColumn: this._state.options.padding,
      endColumn: n - this._state.options.padding,
      startRow: this._state.options.padding,
      endRow: a - this._state.options.padding,
      columns: n,
      rows: a,
      charWidth: e,
      charHeight: t,
      charSpacingX: s,
      charSpacingY: i,
      canvasWidth: this.canvas.width,
      canvasHeight: this.canvas.height
    };
  }
  /**
   * Initialize the renderer with the canvas and options.
   * This sets up the rendering context and prepares for rendering.
   */
  _setupRenderer() {
    [this.canvas.width, this.canvas.height] = this.resizeDimensions, this.renderer.initialize(this.canvas, this._state.options), this.pattern.initialize(this.region), this._state.options.resizeTo instanceof HTMLElement ? (this._state.resizeObserver = new ResizeObserver(this._handleResize), this._state.resizeObserver.observe(this._state.options.resizeTo)) : this._state.options.resizeTo.addEventListener("resize", this._handleResize);
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
    for (const { x: s, y: i, char: n, color: a = "", opacity: o = 1, scale: r = 1, rotation: _ = 0 } of e)
      t ^= (s * 31 + i * 17 ^ n.charCodeAt(0)) + (a.charCodeAt(0) || 0) * 13 + Math.floor(o * 100) * 7 + Math.floor(r * 100) * 5 + Math.floor(_ * 100) * 3;
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
      const s = this._state.options[t], i = e[t];
      return s !== i;
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
    const s = this._options.seed;
    super.setOptions(t), t.seed !== void 0 && t.seed !== s && (this._permutations = this._generatePermutations(this._options.seed));
  }
  update(t) {
    return this;
  }
  /**
   * Generate characters for the current frame using Perlin noise.
   * @param context - the current rendering context with time and region info
   * @returns Array of character data for rendering
   */
  generate({ animationTime: t, region: s }) {
    if (this.options.characters.length === 0)
      return [];
    const i = [];
    for (let n = s.startRow; n <= s.endRow; n++)
      for (let a = s.startColumn; a <= s.endColumn; a++) {
        const o = this._fractalNoise(
          a * this._options.frequency,
          n * this._options.frequency,
          t * 1e-3
        ), r = Math.max(0, Math.min(1, (o + 1) / 2)), _ = Math.floor(r * this._options.characters.length), l = Math.max(0, Math.min(_, this._options.characters.length - 1));
        i.push({
          char: this._options.characters[l],
          x: a * s.charSpacingX,
          y: n * s.charSpacingY,
          opacity: r
        });
      }
    return i;
  }
  /**
   * Generate a proper permutation table for Perlin noise.
   */
  _generatePermutations(t) {
    const s = y(t), i = Array.from({ length: 256 }, (n, a) => a);
    for (let n = 255; n > 0; n--) {
      const a = Math.floor(s() * (n + 1)), o = i[n];
      i[n] = i[a], i[a] = o;
    }
    return i.concat(i);
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
  _lerp(t, s, i) {
    return t + i * (s - t);
  }
  /**
   * 3D gradient function.
   */
  _gradient3D(t, s, i, n) {
    const a = t & 15, o = a < 8 ? s : i, r = a < 4 ? i : a === 12 || a === 14 ? s : n;
    return ((a & 1) === 0 ? o : -o) + ((a & 2) === 0 ? r : -r);
  }
  /**
   * Generate 3D Perlin noise at given coordinates.
   */
  _noise3D(t, s, i) {
    const n = Math.floor(t) & 255, a = Math.floor(s) & 255, o = Math.floor(i) & 255;
    t -= Math.floor(t), s -= Math.floor(s), i -= Math.floor(i);
    const r = this._fade(t), _ = this._fade(s), l = this._fade(i), u = this._permutations[n] + a & 255, m = this._permutations[u] + o & 255, g = this._permutations[u + 1 & 255] + o & 255, f = this._permutations[n + 1 & 255] + a & 255, v = this._permutations[f] + o & 255, D = this._permutations[f + 1 & 255] + o & 255;
    return this._lerp(
      this._lerp(
        this._lerp(
          this._gradient3D(this._permutations[m], t, s, i),
          this._gradient3D(this._permutations[v], t - 1, s, i),
          r
        ),
        this._lerp(
          this._gradient3D(this._permutations[g], t, s - 1, i),
          this._gradient3D(this._permutations[D], t - 1, s - 1, i),
          r
        ),
        _
      ),
      this._lerp(
        this._lerp(
          this._gradient3D(this._permutations[m + 1 & 255], t, s, i - 1),
          this._gradient3D(this._permutations[v + 1 & 255], t - 1, s, i - 1),
          r
        ),
        this._lerp(
          this._gradient3D(this._permutations[g + 1 & 255], t, s - 1, i - 1),
          this._gradient3D(this._permutations[D + 1 & 255], t - 1, s - 1, i - 1),
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
  _fractalNoise(t, s, i = 0) {
    let n = 0, a = 0, o = 1, r = 1;
    for (let _ = 0; _ < this._octaves; _++)
      n += this._noise3D(
        t * r,
        s * r,
        i * r
      ) * o, a += o, o *= this._persistence, r *= this._lacunarity;
    return n / a;
  }
  /**
   * Generate animated noise that changes over time.
   * This creates flowing, organic motion patterns.
   */
  _animatedNoise(t, s, i) {
    const a = this._frequency, o = this._fractalNoise(
      t * a,
      s * a,
      i * 0.01
    ), r = this._fractalNoise(
      (t + 1e3) * a,
      (s + 1e3) * a,
      i * 0.01 * 0.8
    );
    return (o + r * 0.5) / 1.5;
  }
  /**
   * Generate a noise function suitable for ASCII pattern generation.
   */
  _getNoiseFunction(t = "down") {
    return (s, i, n) => {
      let a = s, o = i;
      const r = n;
      switch (t) {
        case "left":
          a = s + n * 0.5;
          break;
        case "right":
          a = s - n * 0.5;
          break;
        case "up":
          o = i + n * 0.5;
          break;
        case "down":
          o = i - n * 0.5;
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
class O extends p {
  constructor(t = {}) {
    super({ ...E, ...t });
    h(this, "_rainDrops", []);
    h(this, "_region", null);
    h(this, "_lastFrameCharacters", []);
  }
  initialize(t) {
    const s = this._rainDrops.length > 0, i = this._region;
    this._region = t, !s || !i || Math.abs(i.columns - t.columns) > 2 || Math.abs(i.rows - t.rows) > 2 ? (this._rainDrops = [], this._lastFrameCharacters = [], this._initializeRainDrops()) : (this._adjustDropsToNewRegion(i, t), this._maintainRainDensity());
  }
  update(t) {
    return this._region ? (this._updateRainDrops(t), this._maintainRainDensity(), this) : this;
  }
  generate(t) {
    if ((!this._region || this._rainDrops.length === 0) && (this._region && this._rainDrops.length === 0 && this._initializeRainDrops(), this._rainDrops.length === 0))
      return [];
    const s = [];
    if (this._options.fadeOpacity > 0)
      for (const i of this._lastFrameCharacters)
        s.push({ ...i, opacity: this._options.fadeOpacity });
    for (const i of this._rainDrops)
      this._renderRainDrop(i, s, t);
    return this._lastFrameCharacters = s.filter((i) => i.opacity !== this._options.fadeOpacity), s;
  }
  _initializeRainDrops() {
    if (!this._region)
      return;
    const t = Math.floor(this._region.columns * this._options.rainDensity), s = Math.max(1, t);
    for (let i = 0; i < s; i++) {
      const n = Math.floor(Math.random() * this._region.columns) + this._region.startColumn, a = this._createRainDrop(n, 0);
      i < Math.max(1, Math.floor(s * 0.3)) && (a.y = Math.random() * this._region.rows), this._rainDrops.push(a);
    }
  }
  _createRainDrop(t, s = 0) {
    const i = Math.floor(
      Math.random() * (this._options.maxDropLength - this._options.minDropLength)
    ) + this._options.minDropLength, n = Array.from(
      { length: i },
      () => this._options.characters[Math.floor(Math.random() * this._options.characters.length)]
    );
    return {
      y: -Math.floor(Math.random() * i) - Math.random() * 10,
      column: t,
      length: i,
      characters: n,
      lastMutationTime: s,
      speed: Math.random() * (this._options.maxSpeed - this._options.minSpeed) + this._options.minSpeed
    };
  }
  _updateRainDrops(t) {
    if (this._region)
      for (const s of this._rainDrops) {
        if (t.isAnimating && (s.y += s.speed * t.animationSpeed * t.deltaTime), t.animationTime - s.lastMutationTime > 1 / this._options.mutationRate && Math.random() < this._options.mutationRate) {
          const i = Math.floor(Math.random() * s.length);
          s.characters[i] = this._options.characters[Math.floor(Math.random() * this._options.characters.length)], s.lastMutationTime = t.animationTime;
        }
        s.y - s.length > this._region.endRow && this._resetRainDrop(s, t.animationTime);
      }
  }
  _resetRainDrop(t, s) {
    this._region && (t.lastMutationTime = s, t.y = -Math.floor(Math.random() * 8) - t.length, t.length = Math.floor(
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
      const s = this._rainDrops.length % this._region.columns + this._region.startColumn, i = this._createRainDrop(s, 0);
      Math.random() < 0.4 && (i.y = Math.random() * this._region.rows + this._region.startRow), this._rainDrops.push(i);
    }
    this._rainDrops.length > t && (this._rainDrops.length = t);
  }
  /**
   * Adjust existing drops to fit a new region without losing current state.
   */
  _adjustDropsToNewRegion(t, s) {
    for (const i of this._rainDrops)
      i.column >= s.startColumn + s.columns ? i.column = i.column % s.columns + s.startColumn : i.column < s.startColumn && (i.column = s.startColumn);
  }
  _renderRainDrop(t, s, i) {
    if (this._region)
      for (let n = 0; n < t.length; n++) {
        const a = Math.floor(t.y) - n;
        if (a < this._region.startRow || a > this._region.endRow || t.column < this._region.startColumn || t.column > this._region.endColumn)
          continue;
        const o = t.column * this._region.charSpacingX, r = a * this._region.charSpacingY;
        let _, l = 1;
        n === 0 ? _ = this._options.headColor : n >= 3 && (l = 1 - n / t.length), s.push({
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
      for (const s of this._rainDrops)
        s.characters = Array.from(
          { length: s.length },
          () => this._options.characters[Math.floor(Math.random() * this._options.characters.length)]
        );
  }
}
h(O, "ID", "rain");
const L = {
  seed: 0
};
class F extends p {
  constructor(e = {}) {
    super({ ...L, ...e });
  }
  update(e) {
    return this;
  }
  generate({ region: e, animationTime: t }) {
    const s = [], i = y(this._options.seed + Math.floor(t * 10));
    for (let n = e.startRow; n <= e.endRow; n++)
      for (let a = e.startColumn; a <= e.endColumn; a++) {
        const o = Math.floor(i() * this._options.characters.length), r = this._options.characters[o] || " ";
        s.push({
          char: r,
          x: a * e.charSpacingX,
          y: n * e.charSpacingY
        });
      }
    return s;
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
  init(e, t, s) {
    return this.renderer = new A(e, t, s), this;
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
  C as DummyPattern,
  p as Pattern,
  b as PerlinNoisePattern,
  O as RainPattern,
  F as StaticNoisePattern,
  T as WebGLRenderer,
  I as createRenderer,
  y as createSeededRandom,
  P as default
};
