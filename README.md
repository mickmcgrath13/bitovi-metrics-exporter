Exporter for Bitovi Metrics

## Strategic Projects

endpoint: `/strategic-project-metrics`
```
# ---
# example_simple:
#   - value: 1
#     tags:
#       tagA: foo
#
strategic-projects:devops:example_simple{tagAa="foo"} 1

# example_simple_zero:
#   - value: 0
#     tags:
#       tagA: foo
#
strategic-projects:devops:example_simple_zero{tagAa="foo"} 0

# example_nested:
#   - value: 1
#     tags:
#       tagA: foo
#     children:
#       childA:
#         - value: 0
#           tags:
#             tagX: bar
#             tagY: baz
#           children:
#             grandchildA:
#               - value: 1
#                 tags:
#                   tagZ: ba1
#                   tagZA: ba2
#         - value: 1
#           tags:
#             tagX: bat
#             tagY: cat
#   - value: 0
#     tags:
#       tagA: xyz
strategic-projects:devops:example_nested{tagA="foo"} 1
strategic-projects:devops:example_nested{tagA="xyz"} 0
strategic-projects:devops:example_nested:childA{tagX="bar",tagY="baz"} 0
strategic-projects:devops:example_nested:childA{tagX="bat",tagY="cat"} 1
strategic-projects:devops:example_nested:childA:grandchildA{tagZ="ba1",tagZA="ba2"} 1
```

## Local Server
```
GITHUB_USERNAME='asdf' \
GITHUB_TOKEN='foo' \
GITHUB_DOMAIN='github.com' \
GITHUB_ORG='foo' \
GITHUB_REPO='foo' \
GITHUB_BRANCH='foo' \
npm start
```

## Local Docker
To run docker container locally, first build it:
```
docker build -t bitovi/bitovi-metrics-exporter .
```

run it:
```
docker run \
--env GITHUB_USERNAME='asdf' \
--env GITHUB_TOKEN='foo' \
--env GITHUB_DOMAIN='github.com' \
--env GITHUB_ORG='foo' \
--env GITHUB_REPO='foo' \
--env GITHUB_BRANCH='foo' \
-p 8080:8080 \
-d bitovi/bitovi-metrics-exporter
```

visit `localhost:8080/strategic-project-metrics`