const { commitRegex } = require("./index.js");
const { expect } = require("chai");

const regex = new RegExp(commitRegex);

describe("commit regex", () => {
  it("will accept single digit semantic versions", () => {
    expect("1.2.3".match(regex)).to.have.length(2);
    expect("1.2.3".match(regex)[1]).to.equal("1.2.3");

    expect("v1.2.3".match(regex)).to.have.length(2);
    expect("v1.2.3".match(regex)[1]).to.equal("1.2.3");
  });

  it("will accept multi digit semantic versions", () => {
    expect("10.11.12".match(regex)).to.have.length(2);
    expect("10.11.12".match(regex)[1]).to.equal("10.11.12");

    expect("v10.11.12".match(regex)).to.have.length(2);
    expect("v10.11.12".match(regex)[1]).to.equal("10.11.12");
  });

  it("will accept single digit semantic versions with prerelease suffixes", () => {
    expect("1.2.3-alpha.0".match(regex)).to.have.length(2);
    expect("1.2.3-alpha.0".match(regex)[1]).to.equal("1.2.3-alpha.0");

    expect("1.2.3-beta.0".match(regex)).to.have.length(2);
    expect("1.2.3-beta.0".match(regex)[1]).to.equal("1.2.3-beta.0");

    expect("v1.2.3-alpha.0".match(regex)).to.have.length(2);
    expect("v1.2.3-alpha.0".match(regex)[1]).to.equal("1.2.3-alpha.0");

    expect("v1.2.3-beta.0".match(regex)).to.have.length(2);
    expect("v1.2.3-beta.0".match(regex)[1]).to.equal("1.2.3-beta.0");
  });

  it("will accept multi digit semantic versions with prerelease suffixes", () => {
    expect("10.11.12-alpha.0".match(regex)).to.have.length(2);
    expect("10.11.12-alpha.0".match(regex)[1]).to.equal("10.11.12-alpha.0");

    expect("10.11.12-beta.0".match(regex)).to.have.length(2);
    expect("10.11.12-beta.0".match(regex)[1]).to.equal("10.11.12-beta.0");

    expect("v10.11.12-alpha.0".match(regex)).to.have.length(2);
    expect("v10.11.12-alpha.0".match(regex)[1]).to.equal("10.11.12-alpha.0");

    expect("v10.11.12-beta.0".match(regex)).to.have.length(2);
    expect("v10.11.12-beta.0".match(regex)[1]).to.equal("10.11.12-beta.0");
  });

  it('will not accept non "v" prefixes', () => {
    expect("x1.2.3".match(regex)).to.be.null;
    expect("x10.11.12".match(regex)).to.be.null;
  });

  it("will not accept unknown prerelease suffixes", () => {
    expect("1.2.3-gamma.0".match(regex)).to.be.null;

    expect("v1.2.3-gamma.0".match(regex)).to.be.null;

    expect("10.11.12-gamma.0".match(regex)).to.be.null;

    expect("v10.11.12-gamma.0".match(regex)).to.be.null;
  });

  it("will not accept invalid prerelease suffixes", () => {
    expect("1.2.3-alpha".match(regex)).to.be.null;

    expect("v1.2.3-alpha".match(regex)).to.be.null;

    expect("10.11.12-alpha".match(regex)).to.be.null;

    expect("v10.11.12-alpha".match(regex)).to.be.null;
  });
});
