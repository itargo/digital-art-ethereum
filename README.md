# digital-art-ethereum
---
## Development
### Setup
* Install dependencies 
```bash
$ yarn install
```   
* Environment setting
```bash
$ cp sample.env .env
```
### Testing
* Run test
```bash
$ truffle test
```
### Compile
* Compile the contract
```bash
$ truffle compile (--all)
```
### Deployment
#### Local
* Deploy to the development network
```bash
$ truffle migrate (--reset)
```
#### Ropsten
* Deploy to the ropsten network
```bash
$ truffle migrate --network ropsten (--reset)
```
