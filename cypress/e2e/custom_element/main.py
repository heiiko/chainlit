import chainlit as cl


@cl.action_callback("test")
async def on_test_action():
    await cl.sleep(1)
    await cl.Message(content="Executed test action!").send()


@cl.on_chat_start
async def on_start():
    inline_custom_element = cl.CustomElement(
        name="Counter", props={"count": 1, "label": "Inline"}
    )
    tail_custom_element = cl.CustomElement(
        name="TailCounter", display="tail", props={"count": 10, "label": "Tail"}
    )
    await cl.Message(
        content="This message has a custom element named Counter and TailCounter!",
        actions=[cl.Action(name="message action", payload={})],
        elements=[inline_custom_element, tail_custom_element],
    ).send()
