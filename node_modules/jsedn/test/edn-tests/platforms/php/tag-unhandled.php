new edn\Tagged(
    new edn\Tag('myapp/Person'),
    edn\create_map([
        edn\keyword('first'),
        "Fred",

        edn\keyword('last'),
        "Mertz",
    ])
)
