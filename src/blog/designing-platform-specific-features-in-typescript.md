---
layout: postPage
title: Designing Dynamically-Featured APIs in TypeScript
description: Or how to abuse conditional types to guarantee the availability of features at compile-time.
tags: post
date: 2021-09-25
hidden: true
---

TODO: HOOK/INTRO

Wouldn't it be nice to have the compiler guarantee to us that the features we are using are compatible and being used correctly?

This is a problem I encountered while writing `deno_notify`, a small library to send system notifications in Deno. Every platform has its own features and ways to setup notifications (e.g. macOS supports a subtitle in addition to the title and body that linux and windows have). I wanted a simple way to allow for the TypeScript API to dynamically change based on which platforms we wanted to support.

> Why can't you just use interfaces?

It's true, one way to approach this problem is with interfaces and inheritance:

```ts
interface Animal {
  say(): void;
}

class Dog implements Animal {
  say() {
    console.log("woof")
  }
}

class Bird implements Animal {
  say() {
    console.log("tweet")
  }
  
  fly() {
    console.log("high in the sky!")
  }
}
```

However, once you start adding more features and want to mix-and-match them together, things can get very messy and you quickly end up with spaghetti 🍝. (*How would you implement a single `walk` method that is available on both `Bird` and `Dog`, but is not available on a new `Snake` variant without duplicating code?*)

We need to find a better solution! Thankfully, TypeScript's type system gives us great tools to attack this problem.

The first thing we'll need are **generics**. Like in other languages, generics let us specify types (for a variable, function, etc.) when we use them rather than when we define them. If you want to learn more, the [TypeScript documentation will explain generics](https://www.typescriptlang.org/docs/handbook/2/generics.html) better than I ever could.

With **conditional types**, we can branch off our resulting types based on the actual type of the generic we are given.

```ts
type IsABird<T extends Animal> = T extends Bird ? true : false;
```

Here `IsABird` will become `true` (as a type) if the given generic type parameter `T` is a `Bird`. Following this logic, we can find all sorts of uses for conditional types.

```ts
type OnlyBirdsAllowed<T extends Animal> = IsABird<T> extends true ? Bird : Error;
```

Again, see the [TypeScript documentation on conditional types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html) for a more in-depth explanation. Hopefully you can see where I'm getting at with these, but let's continue!

Going back to our example with the interfaces, let's see how we can apply these TypeScript features. Instead of using mulitple interfaces, we can create one `Animal` class with which we can implement the shared logic using using a string check (typeguard) at runtime.

```ts
class Animal<AnimalType extends "bird" | "dog"> {
  type: AnimalType;
  
  constructor(type: AnimalType) {
    this.type = type;
  }
  
  say() {
    if (this.type === "bird") {
      console.log("tweet");
    }
    else if (this.type === "dog") {
      console.log("woof")
    }
  }
}
```

Notice that the class's `type` parameter will reflect the generic `AnimalType` parameter (and vice-versa). So, calling the constructor with `Animal("bird")` will automatically infer that the `AnimalType` should be `"bird"`.

Implementing the bird-specific logic of the `fly` method can be done using the conditional types from earlier. 

```ts
fly = (() => {
  console.log("high in the sky!");
}) as AnimalType extends "bird" ? () => void : never;
```

Bit of a mouthful but let's explain things step by step. Here, we tell the compiler that whenever the generic `AnimalType` parameter is `"bird"`, the `fly` property will be a function with type `() => void`. In any other instance such as when `type` is `"dog"`, the `fly` property will instead be of type `never`, which is TypeScript's way of saying "this should never occur/" (i.e. a compiler error).

So that's it! With this, the TypeScript compiler will produce an error whenever an `Animal` that is not a `"bird"` tries to access the `fly()` method.

```ts
const beethoven = new Animal("dog");
beethoven.fly(); // Error: This expression is not callable.

const bubba = new Animal("bird");
bubba.fly(); // "high in the sky!"
```

Careful readers might point out that this does not prevent the use of the function at runtime (such as by casting to `any`). To remedy this, we can add runtime checks like we did in `say()`.

```ts
fly = (() => {
  if (this.type !== "bird") throw new Error("Only birds can fly()")
  
  console.log("high in the sky!");
}) as Type extends "bird" ? () => void : never;
```

This guarantees, **both at compile time and at runtime** that the `fly()` method can only ever be called on a bird.

Though the syntax is a bit *heavy*, it lets us create advanced APIs with specific features that are only available behind flags **at compile time**.

In `deno_notify`, I make use of three separate flags (using generic type parameters) for the platforms that a notification can support. With these, I can specify **different features that are only available on some platforms**:

```ts
/**
 * Set the `icon`.
 * Available on Windows and Linux.
 * 
 * @param icon
 */
public icon = ((icon: string) => {
  if (this.#verifyPlatform(["linux", "windows"], "icon") === false) return;
  this._icon = icon;
  return this;
}) as PlatformFeature<Windows | Linux, (icon: string) => this>;
```

<details>
<summary>So now, different Notification objects may have different APIs based on the platforms they are meant to support.</summary>

For example, a multi-platform notification has no access to platform-specific features. Thus, the following will not compile.

```ts
const notif = new Notification();
// Notification.icon() is not cross-platform, this will error
linuxNotif.icon('/path/to/icon');
```

However, a notification that specifically targets linux or windows (or both) will compile and provide the "extended" API.

```ts
const linuxNotif = new Notification({ linux: true });
// Notification.icon() is now available
linuxNotif.icon('/path/to/icon');
```

And a notification that targets macos will not have access to that feature either, unless `strictSupport` is disabled.

```ts
// Second parameter is `strictSupport`
const linuxNotif = new Notification({ linux: true, macos: true }, false);
// Notification.icon() is silently ignored on macos, but works fine on linux.
linuxNotif.icon('/path/to/icon');
```

</details>

You may have also noticed the `this.#verifyPlatform()` call. This is a [somewhat complicated function](https://github.com/Pandawan/deno_notify/blob/platforms/ts/notification.ts#L208) that verifies at runtime whether or not the current operating system is within the passed list of supported platforms. *(TODO: Switch link to master branch)*

Another useful application of this is to provide **different parameter hints/types based on the platform**. For example, macOS has a limited set of sound files which you can use for notifications. Rather than let the user guess or have a separate enum to access them, we can propose that list of sounds for macOS users while allowing any string for other platforms.

```ts
type MacSoundNames = "Basso" | "Frog" | "Hero" | /* ... */ | "Ping" | "Sosumi";

/**
 * Set the `soundName` to play with the notification.
 *
 * With macOS support, a list of default sounds is provided.
 *
 * @param soundName
 */
public soundName = (
  soundName: MacOS extends true ? MacSoundNames : string,
) => {
  this._soundName = soundName;
  return this;
};
```

TODO: ENDING
