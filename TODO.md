```
SELECT ?item  WHERE {{SERVICE wikibase:around {
  ?item wdt:P625 ?P625 .
  bd:serviceParam wikibase:center "Point(16.4 48.2)"^^geo:wktLiteral .
  bd:serviceParam wikibase:radius "1" .
}
}}
```

```
SELECT ?place ?distance ?placeLabel WHERE {
    SERVICE wikibase:around {
      ?place wdt:P625 ?location .
      bd:serviceParam wikibase:center "Point(16.37350 48.19148)"^^geo:wktLiteral .
      bd:serviceParam wikibase:radius "0.1" .
      bd:serviceParam wikibase:distance ?distance .
    }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
} ORDER BY ?distance LIMIT 100
```
