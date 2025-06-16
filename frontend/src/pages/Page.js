// src/pages/Page.js
import React from "react";
import { useParams } from "react-router-dom";

export default function Page() {
  const { rubrique, sousRubrique } = useParams();

  const formatLabel = (str) =>
    str
      ? str
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())
      : "";

  return (
    <div>
      <h1>{formatLabel(rubrique)}</h1>
      {sousRubrique && <h2>{formatLabel(sousRubrique)}</h2>}
      <p>
        Contenu pour{" "}
        {formatLabel(rubrique)}
        {sousRubrique && ` > ${formatLabel(sousRubrique)}`}
      </p>
    </div>
  );
}
