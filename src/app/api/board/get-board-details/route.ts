import prisma from "@/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Please sign in first to continue" }, { status: 401 });
    }

    const board = await prisma.project.findFirst({
        where: { userId: session.user.id },
        include: {
            categories:{
                select:{
                    id: true,
                    title: true,
                    position: true,
                    tasks: {
                      select: {
                        id: true,
                        name: true,
                        description: true,
                        priority: true,
                        isCompleted: true,
                      }
                    }
                }
            }
        },
    });

    const sortedCategories = board?.categories.sort((a, b) => a.position - b.position);

    const columnMap: any = []
    const columnIds: any = []
    console.log('got board =', board)
    sortedCategories?.forEach((category:any) => {
      columnIds.push(category.title.toLowerCase())
      const items = category.tasks.map((task:any) => ({
        ...task,
        itemId: `item-${task.id}`, // Customize itemId logic as needed
      }));

      columnMap.push({
          title: category.title,
          columnId: category.title.toLowerCase(),
          items: items,
          id: category.id
      })
    });
    
    const data = {
      "id": board?.id,
      "name": board?.name,
      "userId": board?.userId,
      "columnMap": columnMap,
      "orderedColumnIds": columnIds,
      "lastOperation": null
    }
    
    return NextResponse.json(
        { 
          message: "Board created successfully",
          data: data
        },
        { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
