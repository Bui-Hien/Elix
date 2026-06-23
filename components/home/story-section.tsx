'use client'

import Image from 'next/image'
import Link from 'next/link'

function ElementCard({
  image,
  title,
  subtitle,
  href,
  height,
}: {
  image: string
  title: string
  subtitle: string
  href: string
  height: string
}) {
  return (
    <Link
      href={href}
      className={`
        group
        relative
        block
        overflow-hidden
        rounded-md
        ${height}
      `}
    >
      <Image
        src={image}
        alt={title}
        fill
        className="
          object-cover
          transition-transform
          duration-700
          group-hover:scale-105
        "
      />

      {/* Overlay */}

      <div
        className="
          absolute
          inset-0
          bg-black/25
          group-hover:bg-black/35
          transition
        "
      />

      {/* Content */}

      <div className="absolute bottom-8 left-8">

        <div
          className="
            text-white
            text-[38px]
            font-light
            tracking-[8px]
          "
        >
          {title}
        </div>

        <div
          className="
            mt-3
            text-white/90
            text-sm
            tracking-[1px]
          "
        >
          {subtitle}
        </div>

        <div
          className="
            mt-5
            text-white
            text-[13px]
            uppercase
            tracking-[2px]
          "
        >
          Khám phá →
        </div>

      </div>

    </Link>
  )
}

export function StorySection() {

  return (

    <section className="bg-[#f7f5f3] py-24">

      <div className="max-w-7xl mx-auto px-6">

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* LEFT */}

          <div className="lg:col-span-1">

            <h2
              className="leading-tight"
              style={{
                fontSize: 'clamp(42px,5vw,72px)',
                fontWeight: 700,
                color: '#271916',
              }}
            >

              Mệnh

              <br />

              Của

              <br />

              Bạn...

            </h2>

            <p
              className="mt-8"
              style={{
                color: '#6d5f5a',
                fontSize: '16px',
                lineHeight: '30px',
                maxWidth: '250px',
              }}
            >

              Khám phá những viên đá mang năng lượng riêng,
              được chế tác dành riêng cho bản mệnh của bạn.

            </p>

          </div>


          {/* RIGHT */}

          <div className="lg:col-span-3">

            {/* Row 1 */}

            <div className="grid grid-cols-2 gap-5">

              <ElementCard
                image="/elements/kim.jpg"
                title="KIM"
                subtitle="Tinh khiết & Thịnh vượng"
                href="/products?element=kim"
                height="h-[300px]"
              />

              <ElementCard
                image="/elements/moc.jpg"
                title="MỘC"
                subtitle="Sinh trưởng & Bình an"
                href="/products?element=moc"
                height="h-[300px]"
              />

            </div>


            {/* THỦY */}

            <div className="mt-5">

              <ElementCard
                image="/elements/thuy.jpg"
                title="THỦY"
                subtitle="Trí tuệ & May mắn"
                href="/products?element=thuy"
                height="h-[340px]"
              />

            </div>


            {/* Row 3 */}

            <div className="grid grid-cols-2 gap-5 mt-5">

              <ElementCard
                image="/elements/hoa.jpg"
                title="HỎA"
                subtitle="Đam mê & Năng lượng"
                href="/products?element=hoa"
                height="h-[300px]"
              />

              <ElementCard
                image="/elements/tho.jpg"
                title="THỔ"
                subtitle="Vững vàng & Tài lộc"
                href="/products?element=tho"
                height="h-[300px]"
              />

            </div>

          </div>

        </div>

      </div>

    </section>

  )

}