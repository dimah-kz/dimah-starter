"use client"

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@repo/ui/components/input-otp"

const CODE_LENGTH = 6
const groups = [
  [0, 1, 2],
  [3, 4, 5],
]

type OneTimeCodeInputProps = {
  id?: string
  name?: string
  value: string
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  autoFocus?: boolean
  disabled?: boolean
}

/** Six-digit authenticator code. Digits read left to right in every locale. */
export function OneTimeCodeInput({
  id,
  name,
  value,
  onChange,
  onComplete,
  autoFocus,
  disabled,
}: OneTimeCodeInputProps) {
  return (
    <div dir="ltr" className="flex justify-center">
      <InputOTP
        id={id}
        name={name}
        maxLength={CODE_LENGTH}
        pattern="^[0-9]+$"
        inputMode="numeric"
        autoComplete="one-time-code"
        value={value}
        onChange={onChange}
        onComplete={onComplete}
        autoFocus={autoFocus}
        disabled={disabled}
        containerClassName="gap-2"
      >
        {groups.map((group, index) => (
          <div key={group[0]} className="flex items-center gap-2">
            {index > 0 ? <InputOTPSeparator /> : null}
            <InputOTPGroup>
              {group.map((slot) => (
                <InputOTPSlot
                  key={slot}
                  index={slot}
                  className="size-10 text-base"
                />
              ))}
            </InputOTPGroup>
          </div>
        ))}
      </InputOTP>
    </div>
  )
}
