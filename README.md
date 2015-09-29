# Milk

Milk is a language that compiles into JavaScript. It is the love child of Python and JavaScript.

## Philosophy

Milk tries to be as readable and beautiful as Python without sacrificing the typical JavaScript flavor. Thus keywords and operators from JavaScript hasn’t been changed. One can even use a JavaScript syntax highlighter on Milk source code. Check out the [examples](https://github.com/yishn/milk-lang/tree/master/examples) for getting a feeling of the language.

## Language Reference

Just like Python, Milk uses significant whitespace to delimit blocks of code. Semicolons are not necessary to terminate statements, however they can be used to fit several statements onto a single line. A statement is usually terminated by a line ending, but if an expression is too long, a line break at any binary operation such as `+`, `*` or `.` won’t terminate it.

### Functions

There are several ways to define a function in Milk. That’s the standard way to do it:

```js
function square(x):
    r = x * x
    return r
```

Unlike Python you actually can pass such a function as a function argument:

```js
list = [1, 2, 3, 4, 5]

list.map(function(x):
    return x * x
)
```

There is also the lambda notation, a shorthand notation for functions which return an expression immediately:

```js
list.map(x => x * x)

cube = x => square(x) * x
exp = (x, n) => n == 0 ? 1 : x * exp(x, n - 1)
moduloSum = (x, y, n) => (x % n + y % n) % n
```

If you already have a function, you can create a curried function using placeholders `_` like this:

```js
square = exp(_, 2)
cube = exp(_, 3)

mod5Sum = moduloSum(_, _, 5)
// mod5Sum(4, 8) == 2
```

That’s why you should avoid using the underscore as a variable name. Technically, `_` is a keyword, but if Milk can’t make sense of `_`, it’s converted to a normal identifier in JavaScript.

### Arrays and Objects

The syntax for arrays and objects is nearly identical to those in JavaScript. Commas are optional if the items are separated by a line break.

```js
workdays = [
    "Monday", "Tuesday", "Wednesday"
    "Thursday", "Friday"
]

magic = {
    anima: {
        fire: ['Fire', 'Elfire', 'Meteor', 'Bolganone', 'Forblaze']
        wind: ['Wind', 'Elwind', 'Tornado', 'Blizzard', 'Fimbulvetr', 'Excalibur']
        thunder: ['Thunder', 'Elthunder', 'Thoron', 'Bolting', 'Mjölnir']
    }
    light: ['Lightning', 'Shine', 'Divine', 'Purge', 'Aura']
    dark: ['Flux', 'Fenrir', 'Eclipse', 'Nosferatu', 'Luna']
}
```

Milk can flatten arrays inside arrays using the spread operator `*`:

```js
days = ['Sunday', *workdays, 'Saturday']
// days == ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
```

There is no `range` function, but there is the following Ruby-like shorthand notation. Unlike Ruby, there is only one range construct and it works the same everywhere.

```js
stop = 875
range = [0...stop]
// range == [0, 1, 2, 3, ..., 875]

countdown = [10...1]
// countdown == [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]

even = [0, 2, ..., stop]
// even == [0, 2, 4, 6, 8, ..., 874]
odd = [1, 3, ..., stop]
// odd == [1, 3, 5, 7, 9, ..., 875]
```

There are array and object comprehensions just like in Python:

```js
squares = [x * x for x in [1, ..., 10]]
// squares == [1, 4, 9, 16, 25, 36, 49, 64, 81, 100]

nodiag = [[x, y] for x in [1, 2, 3] for y in [1, 2, 3] if x != y]
// nodiag == [[1, 2], [1, 3], [2, 1], [2, 3], [3, 1], [3, 2]]

goboard = [['empty' for x in [1...19]] for y in [1...19]]
// goboard == [
//     ['empty', 'empty', ..., 'empty']
//     ['empty', 'empty', ..., 'empty']
//     ...
//     ['empty', 'empty', ..., 'empty']
// ]

protagonists = ['Ryan', 'Cyn', 'Pat', 'Lio']
dict = {name: name.length for name in protagonists if name != 'Lio'}
// dict == {
//     "Ryan": 4
//     "Cyn": 3
//     "Pat": 3
// }
```

### Control Flow

If statements work just like in Python, except there is no `elif` keyword and expressions look like JavaScript.

```js
age = 16

if age < 6:
    console.log('You are way too young for this.')
else if age < 12:
    console.log('You need adult supervision. Only anima and light magic allowed.')
else if age < 18:
    console.log('You can do it on your own, but no dark magic.')
else:
    console.log('Do what you want, but adhere to the Laws.')
```

Milk supports chained comparisons à la Python. Each expression is evaluated once at most:

```js
if 12 <= age < 18 <= getSupervisorAge() || 18 <= age:
    console.log('You can do dark magic.')
```

There are no `switch` or `with` statements. Try statements do not require a `catch` or `finally` clause and the error parameter is optional:

```js
try:
    // Fire
    invoke(magic.anima.fire[0])
catch e:
    // What now?
    console.error(e)
finally:
    clean()
```

While loops are also straightforward:

```js
while age >= 18 && !isWorking():
    // Nosferatu
    invoke(magic.dark[2])
```

For loops work similar to those in Python. Like in array comprehensions, you can specify a filtering condition with `if`:

```js
for day in days if day != 'Monday':
    console.log(day)
// =>
// Sunday
// Tuesday
// Wednesday
// ...
```

If you loop over objects, Milk will loop over the object keys:

```js
for key in magic:
    console.log(magic)
// =>
// anima
// light
// dark
```

If you specify two variables, the first one will assume the index or key respectively, and the second one will assume the value:

```js
for i, day in days if i >= 1:
    console.log(i, day)
// =>
// 1 Monday
// 2 Tuesday
// 3 Wednesday
// ...

for type, list in magic.anima:
    console.log(type, list.length)
// =>
// fire 5
// wind 6
// thunder 5
```

These looping techniques can be used in an array/object comprehension.

### Pattern Matching

Milk has destructuring assignment syntax like JavaScript:

```js
tome1 = 'General Compositional Theory of Anima Magic, Volume Eight'
tome2 = 'Elder Summoning Theory'

[tome1, tome2] = [tome2, tome1]

index2grid = (i, width) => [i % width, Math.floor(i / width)]
index2goboard = index2grid(_, 19)
[x, y] = index2goboard(243)
```

Pattern matching can be used with any depth of array and object nesting. Use the placeholder keyword if you don’t want to assign the corresponding value.

```js
{anima: {wind: [a, _, b, _, _, _]}, dark} = magic

// Tornado
invoke(b)

console.log(dark)
// => ["Flux", "Fenrir", "Eclipse", "Nosferatu", "Luna"]
```

Use the spread operator `*` to extract a sublist of items:

```js
{anima: {wind: [wind, *rest, excalibur]}} = magic
// rest == ["Elwind", "Tornado", "Blizzard", "Fimbulvetr"]
```

You can use `...` instead of `*_`. It is possible to assign default values to variables, should the extraction be `null` or `undefined`:

```js
[first, second, third = 'Blah'] = [tome1, tome2]
// third == "Blah"
```

You can use patterns nearly everywhere where you have to define variables. In fact, function arguments is just another array pattern:

```js
function addIngredients(first = 'Milk', second, *rest):
    console.log(first)
    console.log(second)

    for ingredient in rest:
        console.log(ingredient)

addIngredients(null, 'Coffee beans', 'Python skin')
// =>
// Milk
// Coffee beans
// Python skin
```

Pattern matching works in for loops:

```js
nodiag = [[x, y] for x in [1, 2, 3] for y in [1, 2, 3] if x != y]
// nodiag == [[1, 2], [1, 3], [2, 1], [2, 3], [3, 1], [3, 2]]

for [x, y] in nodiag:
    console.log(x + y)
// =>
// 3
// 4
// 3
// 5
// 4
// 5
```

And even in catch clauses:

```js
try:
    // Thunder
    invoke(magic.anima.thunder[0])
catch {message, location = getCurrentLocation()}:
    // Probably no thunder
    console.log(message)
finally:
    clean()
```
