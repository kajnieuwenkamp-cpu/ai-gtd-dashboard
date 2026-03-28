from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import anthropic
import json
import os

from models.task import AIRequest

router = APIRouter(prefix="/ai", tags=["ai"])

def get_client():
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    return anthropic.Anthropic(api_key=api_key)

SYSTEM_PROMPT = """Je bent een AI-assistent gespecialiseerd in GTD (Getting Things Done) productiviteitsmethoden.
Je helpt gebruikers met:
- Taken prioriteren en organiseren
- Inbox verwerken en acties identificeren
- Projecten plannen en opsplitsen in concrete stappen
- Context-gebaseerde actie-lijsten opstellen
- Wekelijkse reviews uitvoeren

Geef concrete, beknopte adviezen in het Nederlands. Verwijs naar GTD-principes waar relevant."""


@router.post("/chat")
async def chat_with_ai(request: AIRequest):
    messages = []

    if request.task_context:
        task_summary = "Huidige taken:\n" + "\n".join(
            f"- [{t.priority.value.upper()}] {t.title} ({t.status.value})"
            for t in request.task_context
        )
        messages.append({
            "role": "user",
            "content": task_summary,
        })
        messages.append({
            "role": "assistant",
            "content": "Ik zie je taken. Hoe kan ik je helpen?",
        })

    messages.append({"role": "user", "content": request.message})

    def stream_response():
        with get_client().messages.stream(
            model="claude-opus-4-6",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=messages,
        ) as stream:
            for text in stream.text_stream:
                yield f"data: {json.dumps({'text': text})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(stream_response(), media_type="text/event-stream")


@router.post("/process-inbox")
async def process_inbox(request: AIRequest):
    prompt = f"""Verwerk deze inbox-item volgens GTD:

Item: {request.message}

Geef een JSON-respons met:
- action_type: "do" | "delegate" | "defer" | "delete"
- next_action: concrete eerste stap (als actie)
- project: projectnaam (als meerdere stappen nodig)
- context: @context label (bijv. @computer, @bellen, @boodschappen)
- priority: "low" | "medium" | "high"
- reasoning: korte uitleg

Reageer ALLEEN met geldig JSON. Geen markdown, geen code-blokken, geen backticks, geen uitleg. Begin direct met {{ en eindig met }}."""

    response = get_client().messages.create(
        model="claude-opus-4-6",
        max_tokens=512,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
        output_config={
            "format": {
                "type": "json_schema",
                "schema": {
                    "type": "object",
                    "properties": {
                        "action_type": {"type": "string", "enum": ["do", "delegate", "defer", "delete"]},
                        "next_action": {"type": "string"},
                        "project": {"type": "string"},
                        "context": {"type": "string"},
                        "priority": {"type": "string", "enum": ["low", "medium", "high"]},
                        "reasoning": {"type": "string"},
                    },
                    "required": ["action_type", "next_action", "priority", "reasoning"],
                    "additionalProperties": False,
                },
            }
        },
    )

    return json.loads(response.content[0].text)


@router.post("/process-notes")
async def process_notes(request: AIRequest):
    prompt = f"""Analyseer deze vergadernotitie en extraheer ALLE actiepunten volgens GTD.

Notitie:
{request.message}

Geef een JSON-array met alle acties. Elke actie bevat:
- action_type: "do" | "waiting"
- next_action: concrete taaktitel (kort en actiegericht)
- assignee: wie het moet doen ("ik" of naam van persoon)
- context: @context label
- priority: "low" | "medium" | "high"
- due_hint: deadline of verwachting als tekst (of null)"""

    response = get_client().messages.create(
        model="claude-opus-4-6",
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
        output_config={
            "format": {
                "type": "json_schema",
                "schema": {
                    "type": "object",
                    "properties": {
                        "actions": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "action_type": {"type": "string", "enum": ["do", "waiting"]},
                                    "next_action": {"type": "string"},
                                    "assignee": {"type": "string"},
                                    "context": {"type": "string"},
                                    "priority": {"type": "string", "enum": ["low", "medium", "high"]},
                                    "due_hint": {"type": ["string", "null"]},
                                },
                                "required": ["action_type", "next_action", "assignee", "priority"],
                                "additionalProperties": False,
                            },
                        }
                    },
                    "required": ["actions"],
                    "additionalProperties": False,
                },
            }
        },
    )

    return json.loads(response.content[0].text)
