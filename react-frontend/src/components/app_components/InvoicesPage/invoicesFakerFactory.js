
import { faker } from "@faker-js/faker";
export default (user,count,companyIdIds,itemIds) => {
    let data = [];
    for (let i = 0; i < count; i++) {
        const fake = {
companyId: companyIdIds[i % companyIdIds.length],
item: itemIds[i % itemIds.length],
subTotal: faker.datatype.number(""),
total: faker.datatype.number(""),

updatedBy: user._id,
createdBy: user._id
        };
        data = [...data, fake];
    }
    return data;
};
