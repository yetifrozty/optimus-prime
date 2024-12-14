import { loadData, createResolver } from "./index"


interface Source2 {
  first: {
    special: {
      something: [{text: string}]
    },
    other: string
  }
  second: {
    special: {
      something: {text: string}
    },
    other: string
  }
}

const source: Source2 = {
  first: {
    special: {
      something: [{text: "special"}]
    },
    other: "other"
  },
  second: {
    special: {
      something: {text: "special2"}
    },
    other: "other2"
  }
}

interface Target {
  something: [{Title: string, type: "text"}]
  else: {what: {is: {going: {on: string}}}}
  other: string
}

let data = loadData<Source2, Target>(source, createResolver<Source2, Target, "">("", {
  fields: {
    something: createResolver("first.special.something", {
      each: createResolver("", {
        fields: {
          Title: createResolver("text"),
          type: createResolver("", {
            value: "text"
          })
        }
      })
    }),
    else: createResolver("second.special.something", {
      fields: {
        what: createResolver("", {
          fields: {
            is: createResolver("", {
              fields: {
                going: createResolver("", {
                  fields: {
                    on: createResolver("", {
                      value: "on"
                    })
                  }
                })
              }
            })
          }
        })
      }
    }),
    other: createResolver("", {
      value: "other"
    })
  }
}))

console.log(data)