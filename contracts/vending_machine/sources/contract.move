module vending_machine::versionC {

    use sui::tx_context::{Self, TxContext};
    use sui::balance::{Self};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::transfer;
    use sui::event;

    use retetomat::version4::{Self, Reteta, WhiteList};

    // ===================================================
    // [*] Constants
    const E_IncorrectAmount: u64 = 0;
    const VM : address = @0x7c2a2724665236efdcb27fd06f613075dc9e0edf20a3eefb9ecbac46c35fe35d;


    // ===================================================
    // [*] Module constructor
    // fun init(ctx: &mut TxContext) {

    //     transfer::share_object(ApprovedDoctorList {
    //         id: object::new(ctx),
    //         doctor_address: vector::empty<address>()
    //     })

    // }


    // ===================================================
    // [*] Interface to pay for the drugs
    public entry fun redeem( 
        price: Coin<SUI>, 
        reteta: Reteta,
        whitelist: &mut WhiteList, 
        ctx: &mut TxContext
    ) {
        let cost = version4::get_price(&reteta);
        let payment_balance = coin::value(&price);
        assert!(payment_balance >= cost, E_IncorrectAmount);

        // split the coin if the provided coin's balance is more than required
        let change_coin = coin::split(&mut price, cost, ctx);

        transfer::public_transfer(price, VM);

        let patient = tx_context::sender(ctx);
        transfer::public_transfer(change_coin, patient);

        version4::destroy(whitelist, reteta, ctx);
    }


}