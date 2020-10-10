---
layout: postPage
title: Python Bad
description: A rant about Python and its tooling.
tags: post
date: 2020-10-09
---

*For context, I primarily use C# and JavaScript (or TypeScript) but have dabbled in other languages like Rust, C++, and Swift, among others. I have only rarely used or felt the need to use Python, whether for personal projects or contributing to other people's projects. Therefore, these observations are made with the point of view of an outsider looking in.*

This is a long read so if you want to see my most important points, see [Can I Speak to Your Package Manager](#can-i-speak-to-your-package-manager). Now let’s get to it: Python is bad.

## The Obvious

Of course, you can’t diss Python without dissing its most controversial design decision: the use of indentation as syntax.

Although this seems nice as it improves readability, it feels much too opinionated and removes the choice to format their code how they want from the developer. I've heard stories of people working with others leading to a codebase with a mix of tabs and spaces—atrocious, I know. This can lead to strange behavior with the [interpretation of tabs in mixed code](https://stackoverflow.com/questions/2034517/pythons-interpretation-of-tabs-and-spaces-to-indent).

Nevertheless, I'll concede that this is a minor issue and is mostly personal preference. The mixed tabs and spaces issue can also be avoided with proper guidelines or code formatting.

## Oompa-Lambda

Yet another minor syntax issue, Python's lambdas, or anonymous functions.

```python
x = lambda a, b: a * b
print(x(5, 6))
```

Lambdas aren't necessarily bad; many languages have different syntax for them. But I mainly think that having the word fully spelled out as `lambda` is unnecessary since the point of a lambda is to get a short and quick function—especially when Python uses the abbreviation "def" to define a function. Also, having only a colon (`:`) separate the argument list from the body might be hard to decipher in an overview of a more extended code.

## Expressions Conditional

Most languages use the ternary operator `condition ? exprIfTrue : exprIfFalse`. This feels somewhat natural as it asks, is this condition true? Yes, then do this, otherwise do the other.

Python decided to do it in a strange, almost Yoda-speak way where the "expression if true" comes first: `expr_if_true if condition else expr_if_false`. This feels wrong because you might glance over it, see `x = some_expression`, and assume you will always get this expression, even though there is a condition attached to it.

## Can I Speak to Your Package Manager

Now onto my main beef with Python: the development environment (and/or development experience) is painfully bad. When you want to install a package, you'd think of using `pip`, the default package manager that comes pre-installed with Python.

But what they don't tell you is that `pip` has no distinction between a global and a local package—that is, everything is installed globally. So when you're downloading a project, you must install all its packages globally, only for them to pollute your global environment. If you want to delete a project and no longer need those packages, you can't simply delete the directory as you would in Node; you have to manually uninstall every package (more on that later).

There have been many solutions to this, but the most popular seems to be virtual environments like `pipenv` or `venv`. Rather than fix the problem and allow local packages, these tools fake an environment where the global package installation directory is a local directory in your project.

This sounds like a good workaround, but it also means you must activate a special shell that redirects all those python calls to this fake global installation. If you ever forget to activate the shell or exit it, you might be unknowingly modifying some other package list.

And if you choose not to use virtual environments, then you have to remember to manually remove every package you installed, including its dependencies; otherwise, you might get an even bigger footprint than the infamous `node_modules`.

I've also found that many projects resorted to using Docker to allow for a cleaner and platform-agnostic development environment. This is a good solution to this problem, but again, this isn't needed in most other languages and adds additional configuration and overhead.

## The Revenge of the PIP

If that wasn't enough, `pip` also doesn't actually keep track of package dependencies. If you were to install a package, find out you don't need it, and then uninstall it, you'd expect it to be gone along with all of the unnecessary dependencies it pulled in. But since Python relies on global packages for everything, `pip` can't assume that you're not using one of the dependencies.

So now you're polluting your global namespace, and have to clean it all up manually whenever you uninstall a single package. In Node, npm keeps track of all your package dependencies into a tree, so removing a top-level package removes all its dependencies that aren't in use by other languages. There have been some tools like `pip-autoremove`, but those seem to be for Python 2, not 3, which brings me to my next point.

## The Python That Will Never Die

Python 2 doesn't seem to want to die. I'm guessing it's been used by so many different companies or projects that they have to support this legacy code. People had to keep these two separate installations, each with its own `pip` and its own global packages. The `python` command line would be mapped to Python 2.7 to support legacy software. Overall, it all felt like technical debt that did not plague other languages (see Rust with its amazing `rustup` and cargo's `edition` option).

Thankfully Python 2.7 has finally been deprecated in 2020, but remnants of it are still rampant. Many tools people recommend are exclusive to Python 2 (such as the aforementioned `pip-autoremove`). Needless to say, the transition was pretty rough.

# Somewhat Redeeming Qualities

## Simple™

I will concede that, in part due to its syntax and design decisions (many of which I disagree with), Python has become this almost universal language for pseudocode. It's simple to read and understand, and can be easily translated to other languages. Anybody with prior knowledge in programming can understand it, and perhaps even those who don't.

## A New Challenger Approaches

I've recently found out about this python package manager called [Poetry](https://python-poetry.org/). It seems to handle most of the glaring issues I have with `pip` and the virtual environment fiasco.

This is a major reason why I love the dev/open source community: when one project isn't cutting it, people will make an alternative. Unfortunately, I wish these were simply incorporated into `pip` so I wouldn't have to use an external tool, but baby steps.

## Hip and Cool

Python has a lot of simple yet powerful features like ranges, async, sets, etc. All of which seem to work pretty well and have made their way into other languages (or maybe it got inspired by those other languages). Since it's so popular, any new feature that is implemented will likely be ported over to other languages.

# Reconciled?

I still dislike Python, but maybe some of the issues I have with it are simply things I need to get used to. Or tools I need to replace for other ones, like with Poetry. Overall, I give Python a 7/10, could be better but has definitely contributed to and improved the programming scene.
