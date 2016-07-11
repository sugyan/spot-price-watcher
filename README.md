# spot-price-watcher

[![npm version](https://badge.fury.io/js/spot-price-watcher.svg)](https://badge.fury.io/js/spot-price-watcher)

Monitor EC2 spot prices on your terminal.

![](https://cloud.githubusercontent.com/assets/80381/16308976/0d098802-39a2-11e6-836a-6a01975187af.png)


### Install ###

```
$ npm install spot-price-watcher -g
```

#### Run ####

```
$ spotprice
```

```
$ spotprice --regions us --regions eu-west
```

```
$ spotprice --type g2.2xlarge
```

```
$ cat $HOME/.spotpricerc
{
    regions: [
        'us', 'eu-west'
    ],
    type: 'g2.2xlarge'
}
$ spotprice --sporpricerc $HOME/.spotpricerc
```
