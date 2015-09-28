# Milk

Milk is a language that compiles into JavaScript. It is the love child of Python and JavaScript.

## Philosophy

Milk tries to be as readable and beautiful as Python without sacrificing the typical JavaScript flavor. Thus keywords and operators from JavaScript hasn’t been changed. One can even use a JavaScript syntax highlighter on Milk source code.

## Language Reference

Just like Python, Milk uses significant whitespace to delimit blocks of code. Semicolons are not necessary to terminate statements, however they can be used to fit several statements onto a single line. A statement is usually terminated by a line ending, but if an expression is too long, a line break at any binary operation such as `+`, `*` or `.` won’t terminate it.

### Functions

There are several ways to define a function in Milk. That’s the standard way to do it:

```js
function square(x):
    r = x * x
    return r
```

There is also the lambda notation, a shorthand notation for functions which return an expression immediately:

```js
cube      = x => square(x) * x
exp       = (x, n) => n == 0 ? 1 : x * exp(x, n - 1)
moduloSum = (x, y, n) => (x % n + y % n) % n
```

If you already have a function, you can create a curried function using placeholders `_` like this:

```js
square  = exp(_, 2)
cube    = exp(_, 3)
mod5Sum = moduloSum(_, _, 5)

// mod5Sum(4, 8) == 2
```

That’s why you should avoid using the underscore as a variable name. Technically, `_` is a keyword, but if Milk can’t make sense of `_`, it’s converted to a normal identifier in JavaScript.
