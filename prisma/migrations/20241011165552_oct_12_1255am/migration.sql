-- CreateTable
CREATE TABLE "DecarbonizationArea" (
    "id" UUID NOT NULL,
    "geom" TEXT NOT NULL,
    "description" TEXT,
    "name" TEXT NOT NULL,
    "parkId" INTEGER NOT NULL,

    CONSTRAINT "DecarbonizationArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SequestrationHistory" (
    "id" UUID NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "seqValue" DOUBLE PRECISION NOT NULL,
    "decarbonizationAreaId" UUID NOT NULL,

    CONSTRAINT "SequestrationHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SequestrationHistory" ADD CONSTRAINT "SequestrationHistory_decarbonizationAreaId_fkey" FOREIGN KEY ("decarbonizationAreaId") REFERENCES "DecarbonizationArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;
