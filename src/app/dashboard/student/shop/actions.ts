"use server"

import prisma from "@/lib/prisma"
import { awardPoints } from "@/lib/gamification"
import { revalidatePath } from "next/cache"

export async function getShopItems() {
  try {
    // @ts-ignore
    let items = await prisma.shopItem.findMany({
      orderBy: { priceXp: 'asc' }
    })

    // Seed shop if empty for demo
    if (items.length === 0) {
      // @ts-ignore
      await prisma.shopItem.createMany({
        data: [
          { name: "Neon Blue Frame", description: "A glowing blue pulse for your avatar.", type: "FRAME", priceXp: 500, rarity: "RARE" },
          { name: "Fire Glow Frame", description: "Intense flame animation for elite students.", type: "FRAME", priceXp: 1500, rarity: "EPIC" },
          { name: "Ice Shield Frame", description: "Frozen crystal peaks surrounding your profile.", type: "FRAME", priceXp: 2500, rarity: "LEGENDARY" },
          { name: "Dark Knight Theme", description: "Sleek obsidian dashboard with crimson accents.", type: "THEME", priceXp: 1000, rarity: "RARE" },
          { name: "Ocean Breeze Theme", description: "Calming turquoise and white aesthetic.", type: "THEME", priceXp: 1000, rarity: "RARE" },
          { name: "Victory Badge (Locked)", description: "Unlockable by Classroom Battles.", type: "BADGE", priceXp: 99999, rarity: "LEGENDARY" },
        ]
      })
      // @ts-ignore
      items = await prisma.shopItem.findMany({ orderBy: { priceXp: 'asc' } })
    }

    return { success: true, items }
  } catch (error) {
    console.error("Shop items fetch error:", error)
    return { success: false, items: [] }
  }
}

export async function buyShopItem(studentId: string, itemId: string) {
  try {
    // 1. Fetch student and item
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      // @ts-ignore
      select: { totalXp: true, username: true }
    })

    // @ts-ignore
    const item = await prisma.shopItem.findUnique({
      where: { id: itemId }
    })

    if (!student || !item) return { success: false, error: "Data not found" }

    // 2. Check balance
    // @ts-ignore
    if (student.totalXp < item.priceXp) {
      return { success: false, error: "Not enough XP! Keep studying! 📚" }
    }

    // 3. Check if already owned
    // @ts-ignore
    const alreadyOwned = await prisma.studentItem.findUnique({
      where: {
        studentId_itemId: { studentId, itemId }
      }
    })

    if (alreadyOwned) return { success: false, error: "You already own this item!" }

    // 4. Transaction: Deduct XP and Add to Inventory
    await prisma.$transaction([
      prisma.student.update({
        where: { id: studentId },
        data: {
          // @ts-ignore
          totalXp: { decrement: item.priceXp }
        }
      }),
      // @ts-ignore
      prisma.studentItem.create({
        data: {
          studentId,
          itemId
        }
      })
    ])

    // 5. Revalidate Cache
    // @ts-ignore
    if (student.username) revalidatePath(`/student/${student.username}`)
    revalidatePath(`/dashboard/student`)

    return { success: true }
  } catch (error: any) {
    console.error("Purchase error:", error)
    return { success: false, error: error.message }
  }
}
