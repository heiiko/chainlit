# Fork extension: multi-select Modes and Mode tooltips

This fork extends Chainlit's `cl.Mode` API with two optional parameters:

- `select`: controls whether the picker accepts one or multiple options.
- `tooltip`: adds help text to the Mode trigger, using the same shared tooltip UI as `cl.Action`.

These parameters are fork-specific. Do not assume they are available when the app runs against an unmodified upstream Chainlit installation.

Make sure the application environment installs this fork rather than the upstream PyPI release. An agent can verify the active runtime before using the extension:

```python
import inspect

import chainlit as cl

mode_parameters = inspect.signature(cl.Mode).parameters
assert "select" in mode_parameters
assert "tooltip" in mode_parameters
```

## API

| Parameter | Type                         | Default    | Meaning                                         |
| --------- | ---------------------------- | ---------- | ----------------------------------------------- |
| `id`      | `str`                        | required   | Stable key used in `msg.modes`.                 |
| `name`    | `str`                        | required   | Label displayed on the picker trigger.          |
| `options` | `list[cl.ModeOption]`        | empty list | Available choices.                              |
| `select`  | `Literal["single", "multi"]` | `"single"` | Selection behavior and message value type.      |
| `tooltip` | `str`                        | `""`       | Help text displayed on hover or keyboard focus. |

`select` only accepts `"single"` or `"multi"`. Any other value raises `ValueError`.

`tooltip` is plain text displayed when the user hovers or focuses the Mode trigger. It is hidden while the Mode dropdown is open. A missing or empty tooltip renders no tooltip.

`cl.ModeOption.description` remains separate: it is displayed inside the open dropdown beneath that specific option.

## Complete example

```python
from typing import cast

import chainlit as cl


@cl.on_chat_start
async def on_chat_start():
    model_mode = cl.Mode(
        id="model",
        name="Model",
        tooltip="Choose the model used for this message",
        options=[
            cl.ModeOption(id="fast", name="Fast", default=True),
            cl.ModeOption(id="smart", name="Smart"),
        ],
    )

    source_mode = cl.Mode(
        id="sources",
        name="Sources",
        select="multi",
        tooltip="Choose all source collections that may be searched",
        options=[
            cl.ModeOption(
                id="articles",
                name="Articles",
                description="Search the article archive",
                default=True,
            ),
            cl.ModeOption(
                id="podcasts",
                name="Podcasts",
                description="Search podcast transcripts",
            ),
            cl.ModeOption(
                id="web",
                name="Web",
                description="Search public web sources",
            ),
        ],
    )

    await cl.context.emitter.set_modes([model_mode, source_mode])


@cl.on_message
async def on_message(msg: cl.Message):
    selected_modes = msg.modes or {}

    # A single-select Mode returns one option ID as a string.
    model = cast(str, selected_modes.get("model", "fast"))

    # A multi-select Mode returns one or more option IDs as a list.
    sources = cast(list[str], selected_modes.get("sources", ["articles"]))

    await cl.Message(
        content=f"Model: {model}; sources: {', '.join(sources) or 'none'}"
    ).send()
```

## Message value contract

`msg.modes` is optional and has the effective type:

```python
dict[str, str | list[str]] | None
```

The value depends on the Mode's `select` setting:

| Mode declaration             | `msg.modes[mode_id]` |
| ---------------------------- | -------------------- |
| `select="single"` or omitted | `str`                |
| `select="multi"`             | `list[str]`          |

When a Mode has options, the frontend never sends an empty selection. A multi-select value is still always a list; when the user attempts to clear its final selection, the frontend selects the configured default option, or the first option if no default exists.

The selected values continue to use the existing `modes` JSON field on messages and persisted steps. No database migration beyond the existing Modes migration is required.

## Initial selection behavior

For single-select Modes:

1. The first option with `default=True` is selected.
2. If no option is marked as default, the first option is selected.

For multi-select Modes:

1. Every option with `default=True` is selected.
2. If no option is marked as default, the first option is selected.

The user can toggle multi-select options independently, but cannot leave the Mode empty. If removing the last selection would make it empty, the first default option is restored; if no default exists, the first option is restored. The dropdown remains open while options are toggled and displays a check mark beside each selected option.

In the message composer, each picker trigger displays the Mode's `name`, followed by the icon of every selected `ModeOption`. Selected option names remain visible inside the dropdown rather than replacing the Mode name on the trigger.

## Guidance for app-building agents

- Declare `select="multi"` only when the backend is prepared to consume `list[str]`.
- Do not compare a multi-select value directly with a string. Use membership checks such as `"articles" in sources`.
- Handle `msg.modes is None` for messages created without Mode pickers.
- Use `Mode.tooltip` for help about the overall picker.
- Use `ModeOption.description` for help about one option inside the picker.
- Keep existing single-select declarations unchanged; omitting both new parameters preserves upstream-compatible behavior.

## Compatibility summary

Existing code remains valid:

```python
cl.Mode(id="model", name="Model", options=[...])
```

It behaves as a single-select Mode, returns a string in `msg.modes`, and renders no tooltip. Multi-select arrays are valid JSON inside the existing message `modes` object.
