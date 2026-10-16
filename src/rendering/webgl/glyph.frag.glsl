#version 300 es

precision highp float;
in vec2 v_uv;
in vec4 v_color;
uniform sampler2D u_texture;
uniform bool u_solid;
uniform vec4 u_clip;
out vec4 fragColor;

void main() {
    float coverage = u_solid ? 1.0 : texture(u_texture, v_uv).a;

    vec2 clippedSize = clamp(
        min(gl_FragCoord.xy + 0.5, u_clip.zw) - max(gl_FragCoord.xy - 0.5, u_clip.xy),
        0.0, 1.0
    );

    fragColor = vec4(v_color.rgb, v_color.a * coverage * clippedSize.x * clippedSize.y);
}
