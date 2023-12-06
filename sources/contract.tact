import "./jetton";

// message Mint {
//     amount: Int;
//     receiver: Address;
// }

contract SampleJetton with Jetton {
    total_supply: Int as coins;
    owner: Address;
    content: Cell;
    mintable: Bool;

    init(owner: Address, content: Cell) {
        self.total_supply = 0;
        self.owner = owner;
        self.mintable = true;
        self.content = content;     
    }

    // receive(msg: Mint) {
    //     let ctx: Context = context();
    //     require(ctx.sender == self.owner, "Not owner");
    //     require(self.mintable, "Not mintable");
    //     self.mint(msg.receiver, msg.amount, self.owner); // (to, amount, response_destination)
    // }

    receive(msg: String) {
        let ctx: Context = context();
        require(ctx.sender == self.owner, "Not owner");
        require(self.mintable, "Not mintable");
        self.mint(sender(), 1, self.owner); // (to, amount, response_destination)
    }
} 