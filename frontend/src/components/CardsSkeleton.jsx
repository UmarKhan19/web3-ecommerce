import { Skeleton } from "@mui/material";

Skeleton;
export default function CardsSkeleton() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
      <h2 className="text-2xl font-bold tracking-tight w-[15rem]">
        <Skeleton sx={{ backgroundColor: "#2e3135" }} height={35} />
      </h2>
      <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
        {Array(4)
          .fill()
          .map((_, index) => (
            <div className=" w-full rounded-md flex flex-col" key={index}>
              <div className="h-full w-full  lg:h-full lg:w-full">
                <Skeleton sx={{ backgroundColor: "#2e3135" }} height={300} />
              </div>
              <div className="w-full h-full flex justify-between">
                <Skeleton
                  sx={{ backgroundColor: "#2e3135" }}
                  height={25}
                  width={150}
                />
                <Skeleton
                  sx={{ backgroundColor: "#2e3135" }}
                  height={25}
                  width={100}
                />
              </div>
              <div>
                <Skeleton
                  sx={{ backgroundColor: "#2e3135" }}
                  height={25}
                  width={100}
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
