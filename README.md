# refreshment

A Chrome browser extension for automatically refreshing tabs.

## Installation

Install locally using [an unpacked extension](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked). 
Doing so requires cloning this repo and then loading it in Chrome.

## Usage

In a tab you want refreshed, click on the extension's toolbar icon to have the current tab reload every 5 minutes. To stop reloading click on the toolbar icon again. 

The toolbar icon may be hidden inside the toolbar's extension menu (🧩).

## Why

I am aware there are Chrome extensions out there that do this sort of thing. Unfortunately all of the
ones I saw required more permissions than I felt comfortable with, especially given that I couldn't
see the source code. So it became an excuse to learn a bit about Chrome extensions and write something
that you could quickly audit yourself to be sure it doesn't do anything sketchy.
