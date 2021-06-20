// Mock passport middleware
const passport = {
    authenticate: jest.fn().mockImplementation(
        (strategy: string, options: Object) => {
            return function(req: any, res: any, next: any) {next()}
    })
}

// Auxiliary funtion to get user group details. Returns an array [data, errors]
const getUserGroups = jest.fn().mockImplementation((authorizedToken: string) => {
    // Start getting the correct token
    return [['dummy-test'], null];

});



export {passport, getUserGroups};