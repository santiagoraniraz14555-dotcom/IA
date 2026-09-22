#include <iostream>
#include <vector>
#include <cmath>

// ==============================================================================
// J.A.R.V.I.S. Core C++ Engine
// Motor de aceleración para procesamiento de señales y similitud de memoria (DSP)
// ==============================================================================

extern "C" {
    /**
     * Calcula la similitud de coseno en memoria directa C++ a velocidad nativa.
     */
    __declspec(dllexport) float cosine_similarity_native(const float* vec_a, const float* vec_b, int length) {
        if (!vec_a || !vec_b || length <= 0) return 0.0f;
        
        float dot_product = 0.0f;
        float norm_a = 0.0f;
        float norm_b = 0.0f;

        for (int i = 0; i < length; ++i) {
            dot_product += vec_a[i] * vec_b[i];
            norm_a += vec_a[i] * vec_a[i];
            norm_b += vec_b[i] * vec_b[i];
        }

        if (norm_a <= 0.0f || norm_b <= 0.0f) return 0.0f;
        return dot_product / (std::sqrt(norm_a) * std::sqrt(norm_b));
    }

    /**
     * Filtro rápido de reducción de ruido en buffers de audio PCM.
     */
    __declspec(dllexport) void clean_audio_buffer(float* audio_samples, int length, float noise_gate) {
        if (!audio_samples) return;
        for (int i = 0; i < length; ++i) {
            if (std::abs(audio_samples[i]) < noise_gate) {
                audio_samples[i] = 0.0f;
            }
        }
    }
}
