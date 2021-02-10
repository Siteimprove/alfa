import React, { FunctionComponent } from "react";

import * as ink from "ink";

import * as dom from "@siteimprove/alfa-dom";

export const Source: FunctionComponent<Source.Props> = ({ source }) => (
  <Node source={source} />
);

export namespace Source {
  export interface Props {
    source: dom.Node;
  }
}

const Node: FunctionComponent<Node.Props> = ({ source }) => {
  if (dom.Element.isElement(source)) {
    return <Element source={source} />;
  }

  if (dom.Attribute.isAttribute(source)) {
    return <Attribute source={source} />;
  }

  if (dom.Text.isText(source)) {
    return <Text source={source} />;
  }

  if (dom.Document.isDocument(source)) {
    return <Document source={source} />;
  }

  if (dom.Type.isType(source)) {
    return <Type source={source} />;
  }

  if (dom.Shadow.isShadow(source)) {
    return <Shadow source={source} />;
  }

  return null;
};

namespace Node {
  export interface Props {
    source: dom.Node;
  }
}

const Document: FunctionComponent<Document.Props> = ({ source }) => {
  const children = source.children();

  return (
    <ink.Box flexDirection="column">
      <ink.Text color="blackBright">#document</ink.Text>

      <ink.Box marginLeft={2} flexDirection="column">
        {children.isEmpty()
          ? null
          : children.map((child, index) => <Node source={child} key={index} />)}
      </ink.Box>
    </ink.Box>
  );
};

namespace Document {
  export interface Props {
    source: dom.Document;
  }
}

const Type: React.FunctionComponent<Type.Props> = ({ source }) => (
  <ink.Text color="blackBright">
    {"<!doctype "}
    {source.name}
    {">"}
  </ink.Text>
);

namespace Type {
  export interface Props {
    source: dom.Type;
  }
}

const Shadow: React.FunctionComponent<Shadow.Props> = ({ source }) => {
  const children = source.children();

  return (
    <ink.Box flexDirection="column">
      <ink.Text>#shadow-root ({source.mode})</ink.Text>

      <ink.Box marginLeft={2} flexDirection="column">
        {children.isEmpty()
          ? null
          : children.map((child, index) => <Node source={child} key={index} />)}
      </ink.Box>
    </ink.Box>
  );
};

namespace Shadow {
  export interface Props {
    source: dom.Shadow;
  }
}

const Element: React.FunctionComponent<Element.Props> = ({ source }) => {
  const children = source.children({
    composed: true,
    nested: true,
  });

  return (
    <ink.Box flexDirection="column">
      <ink.Box>
        <ink.Text>{"<"}</ink.Text>
        <ink.Text color="red">{source.name}</ink.Text>

        {[...source.attributes].map((attribute, index) => (
          <ink.Box key={index} marginLeft={1}>
            <Attribute source={attribute} />
          </ink.Box>
        ))}

        <ink.Text>{">"}</ink.Text>
      </ink.Box>

      <ink.Box marginLeft={2} flexDirection="column">
        {children.isEmpty()
          ? null
          : children.map((child, index) => <Node source={child} key={index} />)}
      </ink.Box>

      {source.isVoid() ? null : (
        <ink.Box>
          <ink.Text>{"</"}</ink.Text>
          <ink.Text color="red">{source.name}</ink.Text>
          <ink.Text>{">"}</ink.Text>
        </ink.Box>
      )}
    </ink.Box>
  );
};

namespace Element {
  export interface Props {
    source: dom.Element;
  }
}

const Attribute: React.FunctionComponent<Attribute.Props> = ({ source }) => (
  <ink.Box>
    <ink.Text color="yellow">{source.name}</ink.Text>
    <ink.Text>{'="'}</ink.Text>
    <ink.Text color="blue">{source.value}</ink.Text>
    <ink.Text>{'"'}</ink.Text>
  </ink.Box>
);

namespace Attribute {
  export interface Props {
    source: dom.Attribute;
  }
}

const Text: React.FunctionComponent<Text.Props> = ({ source }) => {
  const { data } = source;

  if (data.trim() === "") {
    return null;
  }

  return <ink.Text>"{data}"</ink.Text>;
};

namespace Text {
  export interface Props {
    source: dom.Text;
  }
}
