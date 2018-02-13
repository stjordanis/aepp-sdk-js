
require('@babel/polyfill')

const EpochHtmlClient = require('../index')

let client1 = new EpochHtmlClient('localhost', 3013, 3113, null, false)
let client2 = new EpochHtmlClient('localhost', 3023, 3123, null, false)
let client3 = new EpochHtmlClient('localhost', 3033, 3133, null, false)

const aensLifecycle = async (domain) => {
  // get account pubkeys
  let account1 = await client1.account.getPublicKey()
  let account3 = await client3.account.getPublicKey()

  let claimedDomain = await client2.aens.query(domain)

  let nameHash
  if (claimedDomain) {
    nameHash = claimedDomain['name_hash']
    console.log(`${domain} has already been registered: ${JSON.stringify(claimedDomain)}`)
  } else {
    nameHash = await client2.aens.fullClaim(domain, 1, 1)
  }

  let updatedNameHash = await client2.aens.update(account3, nameHash)
  console.log(`${updatedNameHash} has been updated!`)
  await client2.base.waitNBlocks(1)

  let aensData = await client2.aens.query(domain)
  if (aensData) {
    console.log(`Updated AENS ${JSON.stringify(aensData)}`)
  }

  let balance1 = await client1.account.getBalance()
  let balance3 = await client3.account.getBalance()
  console.log(`Current balances: AK 1 ${balance1}, AK3 ${balance3}`)
  let success = await client1.base.spend(domain, 1, 1)
  console.log(`Account 1 sent ${success} token to Domain of Account 3!`)
  await client2.base.waitNBlocks(1)

  balance1 = await client1.account.getBalance()
  balance3 = await client3.account.getBalance()
  console.log(`Balances after transfer: AK1 ${balance1}, AK3 ${balance3}`)

  await client2.aens.transfer(nameHash, account1, 1)
  await client2.base.waitNBlocks(1)
  let transferedData = await client2.aens.query(domain)
  if (transferedData) {
    console.log(`Domain data now has pointer address ${JSON.parse(transferedData.pointers)['account_pubkey']}`)
  }

  await client2.aens.revoke(nameHash, 1)
  await client2.base.waitNBlocks(1)

  return true
}

aensLifecycle('aepps.aet').then(
  (claimedDomain) => {
    console.log(claimedDomain ? 'finished with success': 'something went wrong')
  }
).catch((error) => console.log(error))