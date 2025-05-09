import { nanoid } from 'nanoid'
import { SheetModel } from '../types'
import * as theme from './theme'

const UUID = nanoid
export const setTheme = (mapObject: any, isDark: boolean = false) => {
  mapObject.theme = isDark ? theme.darkTheme : theme.lightTheme
  const skeletonExtension = {
    "provider": "org.xmind.ui.skeleton.structure.style",
    "content": {
      "centralTopic": "org.xmind.ui.map.clockwise",
      "mainTopic": "org.xmind.ui.logic.right"
    }
  }
  if (mapObject.extensions && Array.isArray(mapObject.extensions)) {
    mapObject.extensions.push(skeletonExtension)
  } else {
    mapObject.extensions = [skeletonExtension]
  }
}

export const createMap = (centralTopic = 'Central Topic', options = {}): SheetModel => ({
  id: UUID(),
  class: "sheet",
  title: centralTopic,
  rootTopic: {
    id: UUID(),
    class: "topic",
    title: centralTopic,
    structureClass: "org.xmind.ui.logic.right",
    titleUnedited: true,
  },
  topicPositioning: "fixed",
  relationships: [],
  ...options
})

export const addTopic = (parentObject, mainTopic = "Main Topic", options = {}) => {
  parentObject = parentObject.rootTopic || parentObject
  parentObject.children = parentObject.children || {}
  parentObject.children.attached = parentObject.children.attached || []

  const topicObject = {
    id: UUID(),
    title: mainTopic,
    titleUnedited: true,
    ...options
  }
  parentObject.children.attached.push(topicObject)

  return topicObject
}

export const setHyperlink = (topicObject, href) => {
  topicObject.href = href
}

export const fold = topicObject => {
  topicObject.branch = "folded"
}

export const setTextNotes = (topicObject, textContent, htmlContent) => {
  topicObject.notes = {
    plain: {
      content: textContent
    },
    realHTML: {
      content: htmlContent
    }
  }
}

export const makeKeyValueTable = (topicObject, keyValueObject) => {
  topicObject.structureClass = "org.xmind.ui.spreadsheet"
  topicObject.extensions = topicObject.extensions || []
  topicObject.extensions.push({
    provider: "org.xmind.ui.spreadsheet",
    content: [
      {
        name: "columns",
        content: [
          {
            name: "column",
            content: ""
          }
        ]
      }
    ]
  })

  Object.entries(keyValueObject).forEach(([key, value]) => {
    addTopic(addTopic(topicObject, key), value as any)
  })
}

export const allTopics = mapObject => {
  let ret: any[] = []

  function walk(topicObject) {
    ret.push(topicObject)
      ; ((topicObject.children || {}).attached || []).forEach(walk)
  }

  walk(mapObject.rootTopic)
  return ret
}

export const addRelationship = (mapObject, topic1, topic2, options = {}) => {
  const relationship = {
    id: UUID(),
    end1Id: topic1.id,
    end2Id: topic2.id,
    titleUnedited: true,
    ...options
  }
  mapObject.relationships = mapObject.relationships || []
  mapObject.relationships.push(relationship)
  return relationship
}

export const addSingleBoundary = (parentObject, topicObject, options = {}) => {
  const index = parentObject.children.attached.indexOf(topicObject)
  const boundary = {
    id: UUID(),
    range: `(${index},${index})`,
    ...options
  }
  parentObject.boundaries = parentObject.boundaries || []
  parentObject.boundaries.push(boundary)
  return boundary
}

export const addSingleSummary = (parentObject, topicObject, options = {}) => {
  const summaryTopic = {
    id: UUID(),
    title: "Summary",
    titleUnedited: true,
    ...options
  }
  parentObject.children.summary = parentObject.children.summary || []
  parentObject.children.summary.push(summaryTopic)

  const index = parentObject.children.attached.indexOf(topicObject)
  const summary = {
    id: UUID(),
    range: `(${index},${index})`,
    topicId: summaryTopic.id,
    ...options
  }
  parentObject.summaries = parentObject.summaries || []
  parentObject.summaries.push(summary)
  return { summaryTopic, summary }
}
