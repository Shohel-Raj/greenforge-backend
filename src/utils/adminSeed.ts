
import { envFile } from "../config/env";
import { Gender, Role } from "../generated/prisma/enums";
import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";

export const seedAdmin = async () => {
    try {
        const isSuperAdminExist = await prisma.user.findFirst({
            where:{
                role : Role.ADMIN
            }
        })

        if(isSuperAdminExist) {
            console.log("Super admin already exists. Skipping seeding super admin.");
            return;
        }

        const superAdminUser = await auth.api.signUpEmail({
            body:{
                email : envFile.ADMIN_EMAIL,
                password : envFile.ADMIN_PASSWORD,
                name : "Super Admin",
                role : Role.ADMIN,
            }
        })

        await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where : {
                    id : superAdminUser.user.id
                },
                data : {
                    emailVerified : true,
                }
            });

            await tx.admin.create({
                data : {
                    userId : superAdminUser.user.id,
                    name : "Super Admin",
                    email : envFile.ADMIN_EMAIL,
                    gender:Gender.MALE
                }
            })

            
            
        });

        const superAdmin = await prisma.admin.findFirst({
            where : {
                email : envFile.ADMIN_EMAIL,
            },
            include : {
                user : true,
            }
        })

        console.log("Super Admin Created ", superAdmin);
    } catch (error) {
        console.error("Error seeding super admin: ", error);
        await prisma.user.delete({
            where : {
                email : envFile.ADMIN_EMAIL,
            }
        })
    }
}

seedAdmin();