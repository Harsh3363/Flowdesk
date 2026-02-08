import { useState } from "react";

export function Calculator({ title = "Calculator" }: { title?: string }) {
    const [display, setDisplay] = useState("0");
    const [prev, setPrev] = useState("");
    const [op, setOp] = useState("");

    const handleNum = (n: string) => setDisplay(display === "0" ? n : display + n);

    const handleOp = (o: string) => {
        setPrev(display);
        setOp(o);
        setDisplay("0");
    };

    const calc = () => {
        const p = parseFloat(prev);
        const c = parseFloat(display);
        let r = 0;
        if (op === "+") r = p + c;
        else if (op === "-") r = p - c;
        else if (op === "×") r = p * c;
        else if (op === "÷") r = p / c;
        setDisplay(r.toString());
        setPrev("");
        setOp("");
    };

    const clear = () => {
        setDisplay("0");
        setPrev("");
        setOp("");
    };

    const Btn = ({ children, onClick, className = "" }: { children: React.ReactNode; onClick: () => void; className?: string }) => (
        <button onClick={onClick} className={`rounded bg-muted px-4 py-3 text-sm font-medium hover:bg-muted/80 ${className}`}>
            {children}
        </button>
    );

    return (
        <div className="rounded-lg border border-border bg-card p-4 shadow-lg">
            <h3 className="font-semibold mb-4">{title}</h3>
            <div className="mb-3 rounded border bg-background p-4 text-right text-2xl font-mono">{display}</div>
            <div className="grid grid-cols-4 gap-2">
                <Btn onClick={clear} className="bg-destructive/20">C</Btn>
                <Btn onClick={() => handleOp("÷")}>÷</Btn>
                <Btn onClick={() => handleOp("×")}>×</Btn>
                <Btn onClick={() => handleOp("-")}>-</Btn>
                <Btn onClick={() => handleNum("7")}>7</Btn>
                <Btn onClick={() => handleNum("8")}>8</Btn>
                <Btn onClick={() => handleNum("9")}>9</Btn>
                <Btn onClick={() => handleOp("+")} className="row-span-2 bg-primary/20">+</Btn>
                <Btn onClick={() => handleNum("4")}>4</Btn>
                <Btn onClick={() => handleNum("5")}>5</Btn>
                <Btn onClick={() => handleNum("6")}>6</Btn>
                <Btn onClick={() => handleNum("1")}>1</Btn>
                <Btn onClick={() => handleNum("2")}>2</Btn>
                <Btn onClick={() => handleNum("3")}>3</Btn>
                <Btn onClick={calc} className="row-span-2 bg-primary text-primary-foreground">=</Btn>
                <Btn onClick={() => handleNum("0")} className="col-span-2">0</Btn>
                <Btn onClick={() => handleNum(".")}>.</Btn>
            </div>
        </div>
    );
}
