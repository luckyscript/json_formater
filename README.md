# json formater
We always have a headache when we want to make an Object to a json string;

Think this case:
when we want to copy our javascript object`{'a': 1}` to some mock platform, it always shows JSON error, because it's not a correct json.

so we use JSON.stringify and then copy? However, it always produce some escape and other token.

Use this package to solve the problem!just:
```
import formater from 'json-formater';
formater.format('{a: "b"}')
```


## parser

JSON has 2 types
* object
* array

### Objectlike JSON
![](https://www.json.org/img/object.png)

### Arraylike JSON
![](https://www.json.org/img/array.png)

In addition, JSON has 6 value types，include above 2 types and 4 types following.

* number
* string
* boolean
* null

![](https://www.json.org/img/value.png)

### string
![](https://www.json.org/img/string.png)

### number
![](https://www.json.org/img/number.png)

### boolean & null
boolean & null has literal value: true, false, null

### whitespace
Whitespace can be inserted between any pair of tokens. Excepting a few encoding details, that completely describes the language.
![](https://www.json.org/img/whitespace.png)

## generator
transform AST to JSON code