import chainlit as cl


@cl.set_starter_widget
async def starter_widget():
    return cl.StarterWidget(
        header=cl.StarterWidgetHeader(
            title="News Assistant",
            subtitle="Pick a prompt to start the conversation.",
        ),
        tabs=[
            cl.StarterWidgetTab(
                key="trending",
                label="Trending",
                starters=[
                    cl.Starter(label="Top stories", message="Top stories"),
                    cl.Starter(label="Morning briefing", message="Morning briefing"),
                ],
            ),
            cl.StarterWidgetTab(
                key="catch-up",
                label="While you were away",
                starters=[
                    cl.Starter(
                        label="Market brief", message="Give me the latest market brief"
                    ),
                    cl.Starter(
                        label="Politics recap", message="Give me the latest politics recap"
                    ),
                ],
            ),
        ],
        initial_tab="trending",
    )


@cl.on_message
async def on_message(msg: cl.Message):
    await cl.Message(msg.content).send()
