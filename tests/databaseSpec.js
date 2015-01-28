
describe("Database Functions", function () {
  it("Should test setUser", function () {
    var hashTable = makeHash();
    hashTable.insert('Neil', 3);
    var result = hashTable.retrieve("Neil");
    expect(result).toEqual(3);
    hashTable.insert('lieN', 5);
    result = hashTable.retrieve('lieN');
    expect(result).toEqual(5);
  });
});
