module retetomat::version4 {

    use std::string::Self;
    // use std::ascii::Self;
    use std::vector;

    use sui::tx_context::{Self, TxContext};
    use sui::object::{Self, ID, UID};
    use sui::url::{Self, Url};
    use sui::transfer;
    use sui::event;

    const E_NotAdmin: u64 = 1337;
    const E_DoctorNotFound : u64 = 1338;
    const E_VMNotFound : u64 = 1339;
    const E_DoctorAlreadyExists : u64 = 1340;
    const E_VMAlreadyExists : u64 = 1341;

    #[allow(unused_const)]
    const ADMIN: address = @0x9a219ab86060165c5b290d6218bd42daa86ea85edd9decd81f352412e13647c3;
    #[allow(unused_const)]
    const DOCTOR: address = @0x47fa1f0a1e79172953f36a8ee0f438b31e420768152de742cd41ff74901b7888;
    #[allow(unused_const)]
    const VM: address = @0xA1C05;
    #[allow(unused_const)]
    const PATIENT: address = @0xdeadbeef;


    // ===================================================
    // [*] Resources
    struct WhiteList has key, store {
        id: UID,
        doc_address: vector<address>,
        vm_address: vector<address>,
    }

    struct Reteta has key, store {
        id: UID,
        name: string::String,
        description: string::String,
        image_url: Url,
        price: u64,
        date: string::String,
        drugs: vector<string::String>
    }
    
    struct RetetaMinted has copy, drop {
        reteta_id: ID,
        minted_by: address,
    }

    struct RetetaBurned has copy, drop {
        items: vector<string::String>,
        burned_by: address,
    }


    // ===================================================
    // [*] Module constructor
    fun init(ctx: &mut TxContext) {

        transfer::share_object(WhiteList {
            id: object::new(ctx),
            doc_address: vector::empty<address>(),
            vm_address: vector::empty<address>()
        })

    }


    // ===================================================
    // [*] Admin functionality to manipulate whitelist 
    //     (add / remove : doctor / vending machine)
    public entry fun add_doc(
        whitelist: &mut WhiteList, 
        doctor_address: address, 
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == ADMIN, E_NotAdmin);
        assert!(!vector::contains(&whitelist.doc_address, &doctor_address), E_DoctorAlreadyExists);
        vector::push_back(&mut whitelist.doc_address, doctor_address);
    }

    public entry fun remove_doc(
        whitelist: &mut WhiteList, 
        doctor_address: address, 
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == ADMIN, E_NotAdmin);
        let (exists, i) = vector::index_of(&whitelist.doc_address, &doctor_address);
        assert!(exists == true, E_DoctorNotFound);
        vector::remove(&mut whitelist.doc_address, i);
    }
   
    public entry fun add_vm(
        whitelist: &mut WhiteList, 
        vending_machine_address: address, 
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == ADMIN, E_NotAdmin);
        assert!(!vector::contains(&whitelist.vm_address, &vending_machine_address), E_VMAlreadyExists);
        vector::push_back(&mut whitelist.vm_address, vending_machine_address);
    }

    public entry fun remove_vm(
        whitelist: &mut WhiteList, 
        vending_machine_address: address, 
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == @retetomat, E_NotAdmin);
        let (exists, i) = vector::index_of(&whitelist.vm_address, &vending_machine_address);
        assert!(exists == true, E_VMNotFound);
        vector::remove(&mut whitelist.vm_address, i);
    }


    // ===================================================
    // [*] Doctor functionality to mint NTFs
    public entry fun mint(
        whitelist: &WhiteList,
        patient: address,
        name: string::String,
        description: string::String,
        price: u64,
        date: string::String,
        drugs: vector<string::String>,
        image_url: string::String,
        ctx: &mut TxContext
    ) {
        let doctor = tx_context::sender(ctx);
        assert!(vector::contains(&whitelist.doc_address, &doctor), E_DoctorNotFound);

        let id = object::new(ctx);
        event::emit(RetetaMinted {
            reteta_id: object::uid_to_inner(&id),
            minted_by: tx_context::sender(ctx),
        });

        let nft = Reteta { 
            id: id, 
            name: name, 
            description: description,
            image_url: url::new_unsafe(string::to_ascii(image_url)) ,
            price: price,
            date: date, 
            drugs: drugs
        };
        transfer::public_transfer(nft, patient);
    }


    // ===================================================
    // [*] Vending Machine functionality to burn NFTs
    public entry fun destroy(
        _whitelist: &mut WhiteList, 
        reteta: Reteta, 
        ctx: &mut TxContext
    ) {
        let burner_addr = tx_context::sender(ctx); 
        // assert!(vector::contains(&whitelist.vm_address, &vm), E_VMNotFound);

        let Reteta { id, name: _, description: _, image_url: _, price: _, date: _, drugs } = reteta;
        object::delete(id);

        event::emit(RetetaBurned {
            items: drugs,
            burned_by: burner_addr, // owner or vending machine
        });
    }


    // ===================================================
    // [*] Patients functionality to inspect NTFs
    public fun get_name(reteta: &Reteta): string::String { reteta.name }

    public fun get_description(reteta: &Reteta): string::String { reteta.description }

    public fun get_items(reteta: &Reteta): &vector<string::String> { &reteta.drugs }

    public fun get_url(reteta: &Reteta): Url { reteta.image_url }

    public fun get_price(reteta: &Reteta): u64 { reteta.price }

    public fun get_doctors(whitelist: &WhiteList): vector<address> { whitelist.doc_address }

    public fun get_vms(whitelist: &WhiteList): vector<address> { whitelist.vm_address }


    // ===================================================
    // [*] TESTS

    #[test_only]
    use std::debug;
    #[test_only]
    use sui::test_scenario::{Self, ctx};
    // #[test_only]
    // use sui::coin::{Self, Coin};
    // #[test_only]
    // use sui::sui::SUI;

    // use retetomat::version1;

    #[test]
    fun test_admin() {
        // deploy contract
        let scenario_val = test_scenario::begin(ADMIN);
        let scenario = &mut scenario_val;

        // let coin = coin::mint_for_testing<SUI>(100, ctx(scenario));
        init(ctx(scenario));

        // add doctor to whitelist
        test_scenario::next_tx(scenario, ADMIN);

        let whitelist = test_scenario::take_shared<WhiteList>(scenario);

        add_doc(&mut whitelist, DOCTOR, ctx(scenario));
        let doctors = get_doctors(&whitelist);
        debug::print(&doctors);

        test_scenario::return_shared(whitelist);
        test_scenario::end(scenario_val);
    }

    #[test]
    fun test_doctor() {
        // deploy contract
        let scenario_val = test_scenario::begin(ADMIN);
        let scenario = &mut scenario_val;

        init(ctx(scenario));

        // add doctor to whitelist
        test_scenario::next_tx(scenario, ADMIN);

        let whitelist = test_scenario::take_shared<WhiteList>(scenario);
        add_doc(&mut whitelist, DOCTOR, ctx(scenario));
        let doctors = get_doctors(&whitelist);
        debug::print(&doctors);
        test_scenario::return_shared(whitelist);

        test_scenario::next_tx(scenario, DOCTOR);
        whitelist = test_scenario::take_shared<WhiteList>(scenario);
        let patient = PATIENT;
        let name = string::utf8(b"Gicu");
        let description = string::utf8(b"Pentru durere in gat");
        let price = 12;
        let date = string::utf8(b"10.11.2024");
        let drugs : vector<string::String> = vector::empty();
        vector::push_back(&mut drugs, string::utf8(b"paracetamol"));
        vector::push_back(&mut drugs, string::utf8(b"strepsils"));
        let url = string::utf8(b"https://imgur.com");
        mint(&whitelist, patient, name, description, price, date, drugs, url, ctx(scenario));
        test_scenario::return_shared(whitelist);

        test_scenario::end(scenario_val);
    }

    // fun test_vm() {

    // }

}