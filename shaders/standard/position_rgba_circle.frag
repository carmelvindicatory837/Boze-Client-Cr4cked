#version 330 core

out vec4 color;

in vec4 v_Position;
in vec4 v_Color;
in vec4 v_Center;
in float v_Smoothing;
in float v_MaxRadius;
in float v_MinAngle;
in float v_MaxAngle;

void main() {
    float angle = degrees(atan(v_Position.x - v_Center.x, v_Center.y - v_Position.y));
    if (angle < 0.0) angle += 360.0;

    float distance = distance(v_Position.xy, v_Center.xy);

    if ((angle < v_MinAngle || angle > v_MaxAngle) && !(angle == 0.0 && v_MaxAngle == 360.0) && !(angle == 360.0 && v_MinAngle == 0.0)) {
        discard;
    } else if (distance > v_MaxRadius) {
        float diff = v_MaxRadius * 0.1;
        float blur = 1.0 - smoothstep(v_MaxRadius, v_MaxRadius + diff, distance);
        color = vec4(v_Color.rgb, v_Color.a * blur * 0.5);
        if (v_Smoothing < 0.5) {
            color.a = 0.0;
        }
    } else {
        color = v_Color;
    }
}

