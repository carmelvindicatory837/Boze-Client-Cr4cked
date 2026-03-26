#version 330 core

#define PI 3.1415926535897932384626433832795

out vec4 color;

uniform sampler2D u_Texture;

in vec2 v_TexturePosition;
in vec4 v_Color;
in vec4 v_Position;
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
    } else {
        float grad_angle = (v_Color.g - 0.5) * 2.0 * PI;

        float cosG = cos(grad_angle - PI);
        float sinG = sin(grad_angle);

        float aCosG = acos(cosG);
        float aSinG = asin(sinG);

        float cG = (aCosG / PI) * 2 - 1;
        float sG = (aSinG / PI) * 2;

        float xB = step(0.25, v_Color.g) * step(v_Color.g, 0.75);
        float yB = step(0.5, v_Color.g);

        float xG = (xB - v_TexturePosition.x) * cG;
        float yG = (yB - v_TexturePosition.y) * sG;

        vec3 c = texture(u_Texture, vec2((xG + yG), v_Color.r)).rgb;

        if (distance > v_MaxRadius) {
            float diff = v_MaxRadius * 0.1;
            float blur = 1.0 - smoothstep(v_MaxRadius, v_MaxRadius + diff, distance);
            color = vec4(c, v_Color.a * blur * 0.5);
            if (v_Smoothing < 0.5) {
                color.a = 0.0;
            }
        } else {
            color = vec4(c, v_Color.a);
        }
    }
}

