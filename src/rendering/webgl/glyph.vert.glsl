#version 300 es

precision highp float;
in vec4 a_rect;
in vec4 a_uv;
in vec4 a_color;
in vec4 a_transform;
uniform vec2 u_resolution;
out vec2 v_uv;
out vec4 v_color;

const vec2 corners[6] = vec2[6](
    vec2(0, 0), vec2(1, 0), vec2(0, 1),
    vec2(0, 1), vec2(1, 0), vec2(1, 1)
);

void main() {
    vec2 corner = corners[gl_VertexID];
    vec2 local = a_rect.xy + corner * a_rect.zw - a_transform.xy;

    vec2 position = a_transform.xy + vec2(
        local.x * a_transform.z - local.y * a_transform.w,
        local.x * a_transform.w + local.y * a_transform.z
    );

    gl_Position = vec4((position / u_resolution * 2.0 - 1.0) * vec2(1, -1), 0, 1);
    v_uv = a_uv.xy + corner * a_uv.zw;
    v_color = a_color;
}
