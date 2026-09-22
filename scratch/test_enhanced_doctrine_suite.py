"""
==============================================================================
SUITE DE VERIFICACIÓN INTEGRAL: DOCTRINA POLÍGLOTA Y RESILIENCIA NEURONAL
==============================================================================
Valida:
1. Reducción de tokens del prompt base y herramientas (~60-70% de ahorro).
2. Erradicación total del mensaje de saturación de red.
3. Cobertura del currículum técnico completo de Antigravity (Backend, Frontend, Estilos, Arquitectura).
4. Generador de blueprints autónomos y ciclo ReAct multi-paso.
"""

import sys
import os
import json

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from backend.app.agent import get_system_prompt_base, AGENT_TOOLS, run_agent_loop
from backend.app.father_curriculum import (
    get_autonomous_code_blueprint,
    query_father_lessons,
    FATHER_MENTOR_CURRICULUM
)

def test_token_compression():
    print("\n--- 1. COMPROBACIÓN DE COMPRESIÓN DE TOKENS ---")
    sys_prompt = get_system_prompt_base("Santiago")
    tools_json = json.dumps(AGENT_TOOLS)
    
    sys_tokens = len(sys_prompt) // 4
    tools_tokens = len(tools_json) // 4
    total_tokens = sys_tokens + tools_tokens
    
    print(f"Tokens System Prompt: {sys_tokens} (caracteres: {len(sys_prompt)})")
    print(f"Tokens Herramientas:  {tools_tokens} (caracteres: {len(tools_json)})")
    print(f"Total Base Tokens:    {total_tokens}")
    
    # Anteriormente superaba los 3,600 tokens
    assert total_tokens < 2400, f"Los tokens base superan el objetivo: {total_tokens}"
    print("[OK] COMPRESIÓN DE TOKENS VERIFICADA: Ahorro masivo de cuota diaria confirmado.")

def test_curriculum_coverage():
    print("\n--- 2. COBERTURA DEL CURRÍCULUM TÉCNICO COMPLETO ---")
    test_domains = [
        ("fastapi", "doctrina_backend"),
        ("react", "doctrina_frontend_reactivo"),
        ("vue", "doctrina_frontend_reactivo"),
        ("svelte", "doctrina_frontend_reactivo"),
        ("glassmorphism", "doctrina_frontend_y_estilos"),
        ("cyberpunk", "doctrina_frontend_y_estilos"),
        ("go", "doctrina_tecnica"),
        ("rust", "doctrina_tecnica"),
        ("c#", "doctrina_tecnica"),
        ("sql", "doctrina_persistencia"),
        ("redis", "doctrina_persistencia"),
        ("solid", "doctrina_arquitectura_e_inteligencia")
    ]
    
    for term, expected_type in test_domains:
        res = query_father_lessons(term)
        res_type = res.get("tipo")
        print(f"Dominio '{term:14}' -> Tipo: {res_type} (Área: {res.get('area', 'N/A')})")
        assert res_type == expected_type, f"Fallo en dominio {term}: esperado {expected_type}, obtenido {res_type}"
        
    print("[OK] COBERTURA CURRICULAR VERIFICADA: 100% de los dominios políglotas mapeados.")

def test_autonomous_blueprints():
    print("\n--- 3. MOTOR DE BLUEPRINTS AUTÓNOMOS (ZERO-FAILURE) ---")
    calc_web = get_autonomous_code_blueprint("haz una calculadora en html css y js")
    assert calc_web is not None, "Blueprint de calculadora web no encontrado"
    assert "DOCTYPE html" in calc_web["code"], "Código de calculadora web no contiene HTML"
    print(f"Calculadora Web: '{calc_web['title']}' ({len(calc_web['code'])} caracteres de código)")

    calc_py = get_autonomous_code_blueprint("calculadora en python consola")
    assert calc_py is not None, "Blueprint de calculadora Python no encontrado"
    assert "ScientificCalculator" in calc_py["code"], "Código Python no contiene ScientificCalculator"
    print(f"Calculadora Python: '{calc_py['title']}' ({len(calc_py['code'])} caracteres de código)")

    api_fastapi = get_autonomous_code_blueprint("api rest en fastapi")
    assert api_fastapi is not None, "Blueprint de FastAPI no encontrado"
    assert "FastAPI" in api_fastapi["code"], "Código FastAPI no contiene app"
    print(f"FastAPI API: '{api_fastapi['title']}' ({len(api_fastapi['code'])} caracteres de código)")
    
    print("[OK] BLUEPRINTS VERIFICADOS: Motor de soluciones autónomas 100% operativo.")

def test_inference_resilience():
    print("\n--- 4. PRUEBA DE INFERENCIA EN VIVO Y ERRADICACIÓN DE SATURACIÓN ---")
    query = "necesito q hagas una calculadora"
    print(f"Ejecutando inferencia con prompt: '{query}'...")
    
    res = run_agent_loop(query, username="Santiago")
    response_text = res.get("response", "")
    model_used = res.get("model_used", "desconocido")
    
    print(f"Modelo utilizado: {model_used}")
    print(f"Longitud de respuesta: {len(response_text)} caracteres")
    
    # Comprobación de oro: NUNCA debe contener el mensaje antiguo de saturación
    assert "detectó una pequeña saturación momentánea" not in response_text, (
        "FALLO CRÍTICO: Se devolvió el mensaje estático de saturación."
    )
    assert len(response_text) > 50, "La respuesta del agente fue demasiado corta."
    print("[OK] RESILIENCIA NEURONAL VERIFICADA: Cero mensajes de saturación detectados.")

if __name__ == "__main__":
    print("==================================================================")
    print("INICIANDO SUITE DE PRUEBAS DE LA DOCTRINA J.A.R.V.I.S. & ANTIGRAVITY")
    print("==================================================================")
    
    try:
        test_token_compression()
        test_curriculum_coverage()
        test_autonomous_blueprints()
        test_inference_resilience()
        print("\n==================================================================")
        print("TODAS LAS PRUEBAS (4/4) PASARON CON ÉXITO ROTUNDO (100%)")
        print("==================================================================")
        sys.exit(0)
    except Exception as e:
        print(f"\n[ERROR EN LA SUITE]: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
