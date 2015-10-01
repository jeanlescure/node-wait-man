# NodeJS Wait Manager Package
Waiting Manager makes testing for asynchronous calls easy as pie. Originally created tu use along with `jasmine` specs, to allow waiting for BackboneJS and AngularJS multiple models and views to load before running specs.

## Installation

To install simply run:

`$ npm install --save node-wait-man`

## Usage

### Instantiation in a regular NodeJS environment would look like this:

```
  waitMan = new WaitMan();
  waiterCollection = new waitMan.WaiterCollection();
  waiter_a = new waitMan.Waiter();
  waiter_b = new waitMan.Waiter();
  
  waiter_a.test = function(){ return async_complete_a; }; // check for some boolean global variable
  waiter_b.test = function(){ return async_complete_b; }; // check for some boolean global variable
  
  // Do something when collection of waiters have completed
  waiterCollection.onDone = function(){
    // ...
  };
  
  waiterCollection.timeout = 300;
  
  waiterCollection.begin();
```

### Useful methods and properties:

```
waiterCollection.interval // Property which determines in milliseconds how often to poll waiters (default: 100)
waiterCollection.abort(); // Stop waiting

waiterCollection.pending_waiters // Array of pending waiters
waiterCollection.successful_waiters // Array of successful waiters
waiterCollection.aborted_waiters // Array of aborted waiters (includes waiters which have reached timeout limit)
```

## Specs

To run specs, simply install dependencies on root folder of this repo:

`$ npm install`

and then run the following command:

`$ npm test`
