from fastapi import APIRouter
from sympy import symbols, solve, sympify, sqrt, Eq, SympifyError
from sympy.parsing.sympy_parser import (
    parse_expr,
    standard_transformations,
    implicit_multiplication_application,
)
from models import MathRequest, MathResponse
import re

router = APIRouter()

TRANSFORMATIONS = standard_transformations + (implicit_multiplication_application,)


def solve_problem(problem: str) -> str:
    problem = problem.strip()

    # Handle equations like "2x + 5 = 15"
    if "=" in problem:
        parts = problem.split("=", 1)
        lhs_str, rhs_str = parts[0].strip(), parts[1].strip()
        lhs = parse_expr(lhs_str, transformations=TRANSFORMATIONS)
        rhs = parse_expr(rhs_str, transformations=TRANSFORMATIONS)
        equation = Eq(lhs, rhs)

        # Find all free symbols
        free_syms = equation.free_symbols
        if not free_syms:
            return "True" if lhs == rhs else "False"

        # Solve for each symbol
        results = []
        for sym in sorted(free_syms, key=str):
            sol = solve(equation, sym)
            if sol:
                sol_strs = [f"{sym} = {s}" for s in sol]
                results.extend(sol_strs)
        return ", ".join(results) if results else "No solution found"

    # Numeric / symbolic expression
    expr = parse_expr(problem, transformations=TRANSFORMATIONS)
    result = expr.evalf()
    # If it's an integer-valued float, show as int
    if result == int(result):
        return str(int(result))
    return str(result)


@router.post("/math", response_model=MathResponse)
async def solve_math(req: MathRequest):
    try:
        result = solve_problem(req.problem)
        return MathResponse(result=result)
    except (SympifyError, SyntaxError, TypeError, ValueError) as e:
        return MathResponse(result="", error=f"Invalid expression: {str(e)}")
    except Exception as e:
        return MathResponse(result="", error=f"Could not solve: {str(e)}")
