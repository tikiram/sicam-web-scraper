
# SICAM Scraper

## First Use

```bash
npm install
```

## Use

Create config file `scrapConfig.json` based on `scrapConfig-example.json`

```bash
node prueba.js
```

## Update

```bash
git pull origin master
```

---

## Usage

El campo `fields` de un `device` soporta valores _string_ o _objetos de configuración_, un objeto de configuración esta compuesto de `name` y `valueCellOffset` en donde se indica la cantidad de celdas a la que se encuentra el valor. Un `field` de tipo _string_ usara por defecto un valor de `valueCellOffset` igual a `1`.

En el ejemplo se proporcionan 3 campos, el primero en modo _string_ y los siguientes dos como _objetos de configuración_.


```json
    {
      "name": "one",
      "uri": "./UB_Page.txt",
      "fields": [
        "WP_imp",
        {
          "name": "WP_exp",
          "valueCellOffset": 1
        },
        {
          "name": "WP_imp",
          "valueCellOffset": 2
        }
      ]
    }

```